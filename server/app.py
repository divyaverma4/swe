from flask import Flask, request, jsonify, g
from flask_cors import CORS
import jwt
import os
from dotenv import load_dotenv
from functools import wraps
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)
CORS(app) 

JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not JWT_SECRET or not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_JWT_SECRET, SUPABASE_URL, and SUPABASE_SERVICE_KEY must be set.")

# --- Supabase Client ---
# Initialize the Supabase client using the SERVICE KEY
# This client has admin rights and bypasses RLS.
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("Supabase service client initialized.")
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    supabase = None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated',
                issuer=f'{SUPABASE_URL}/auth/v1'
            )
            g.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(*args, **kwargs)
    return decorated

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/status')
@token_required
def status():
    user_id = g.user.get('sub')
    user_email = g.user.get('email')
    return jsonify({
        'status': 'ok',
        'message': 'You are authenticated!',
        'user_id': user_id,
        'user_email': user_email
    }), 200

# Fetches data from the 'profiles' table for the logged-in user
@app.route('/profile', methods=['GET'])
@token_required
def get_profile():
    if not supabase:
        return jsonify({'message': 'Database client not initialized'}), 500

    # Get the user's UUID from the token (which the decorator put in 'g')
    user_id = g.user.get('sub') 

    try:
        # Use the service client to fetch data
        # We query the 'profiles' table where the 'id' column matches the user_id
        response = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        
        # response.data will contain the profile data
        # e.g., {'id': '...', 'username': 'testuser', 'avatar_url': '...'}
        
        if not response.data:
            return jsonify({'message': 'Profile not found.'}), 404
            
        return jsonify(response.data), 200

    except Exception as e:
        print(f"Error fetching profile: {e}")
        # Check for specific PostgREST errors if you want
        return jsonify({'message': 'Error fetching profile', 'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)