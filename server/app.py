from flask import Flask, request, jsonify, g
from flask_cors import CORS
import jwt
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app)

JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')
SUPABASE_URL = os.getenv('SUPABASE_URL')

if not JWT_SECRET or not SUPABASE_URL:
    raise ValueError("SUPABASE_JWT_SECRET and SUPABASE_URL must be set in environment variables.")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check if 'Authorization' header is present
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            # Expected format: "Bearer <token>"
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Verify the token
            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated',
                issuer=f'{SUPABASE_URL}/auth/v1'
            )
            
            # Store the decoded payload (which contains user info) in Flask's global 'g' object for this request
            g.user = payload
            print(f"Authenticated user: {g.user.get('sub')}")

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        # Continue to the original route function
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

    print(f"Status endpoint was called by authenticated user: {user_id}")
    return jsonify({
        'status': 'ok',
        'message': 'You are authenticated!',
        'user_id': user_id,
        'user_email': user_email
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)