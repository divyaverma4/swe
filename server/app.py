from flask import Flask, request, jsonify, g
from flask_cors import CORS
import jwt
import os
from dotenv import load_dotenv
from functools import wraps
from supabase import create_client, Client
import requests

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
            # store decoded payload and raw token for later use
            g.user = payload
            g.token = token
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


# Upload endpoint: accepts multipart/form-data with 'file', 'title', 'description'
@app.route('/upload', methods=['POST'])
@token_required
def upload_artwork():
    if not supabase:
        return jsonify({'message': 'Database client not initialized'}), 500

    user_id = g.user.get('sub')
    token = getattr(g, 'token', None)
    if not token:
        return jsonify({'message': 'Missing user token'}), 401

    if 'file' not in request.files:
        return jsonify({'message': 'No file part in request'}), 400

    file = request.files['file']
    filename = file.filename
    if not filename:
        return jsonify({'message': 'File must have a filename'}), 400

    # Build object path: user_id/filename
    object_path = f"{user_id}/{filename}"

    # Upload to Supabase Storage using the user's JWT so the storage owner is the user
    upload_url = f"{SUPABASE_URL}/storage/v1/object/artworks/{object_path}"

    headers = {
        'Authorization': f'Bearer {token}',
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': file.content_type or 'application/octet-stream'
    }

    try:
        print(f"[upload] user_id={user_id} filename={filename} object_path={object_path}")
        print(f"[upload] upload_url={upload_url}")
        print(f"[upload] request.files keys={list(request.files.keys())}")
        resp = requests.put(upload_url, data=file.read(), headers=headers)
        print(f"[upload] storage response status={resp.status_code} text={resp.text}")
        if not resp.ok:
            return jsonify({'message': 'Failed to upload to storage', 'status_code': resp.status_code, 'body': resp.text}), 500
    except Exception as e:
        print(f"[upload] exception during upload: {e}")
        return jsonify({'message': 'Error uploading to storage', 'error': str(e)}), 500

    # Insert metadata into artworks table
    title = request.form.get('title') or 'Untitled'
    description = request.form.get('description') or ''

    try:
        insert_resp = supabase.table('artworks').insert({
            'user_id': user_id,
            'title': title,
            'description': description,
            'image_url': object_path,
            'is_public': True
        }).execute()

        # Some client libraries return a response object with `.data` and `.error`, others return tuples.
        print(f"[upload] insert_resp: {insert_resp}")
        data = getattr(insert_resp, 'data', None) or (insert_resp[0] if isinstance(insert_resp, (list, tuple)) and len(insert_resp) > 0 else None)
        err = getattr(insert_resp, 'error', None) or (insert_resp[1] if isinstance(insert_resp, (list, tuple)) and len(insert_resp) > 1 else None)
        if err:
            print(f"[upload] insert error: {err}")
            return jsonify({'message': 'Failed to insert artwork record', 'error': str(err)}), 500

        return jsonify({'message': 'Uploaded', 'row': data}), 201
    except Exception as e:
        return jsonify({'message': 'Error inserting artwork', 'error': str(e)}), 500


@app.route('/signed-url')
@token_required
def signed_url():
    # Return a short-lived signed URL for an object path
    path = request.args.get('path')
    bucket = request.args.get('bucket') or 'artworks'
    expires = int(request.args.get('expires') or 60)

    if not path:
        return jsonify({'message': 'path query parameter required'}), 400

    try:
        # supabase.storage.from_(bucket).create_signed_url(path, expires)
        storage = supabase.storage
        res = storage.from_(bucket).create_signed_url(path, expires)
        # res may be a dict like { 'signedURL': '...' } or have data property depending on client
        if isinstance(res, dict):
            return jsonify(res), 200
        # Fallback when using client that returns (data, error)-like tuple
        return jsonify({'signed_url': getattr(res, 'signed_url', None) or getattr(res, 'data', None)}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to create signed url', 'error': str(e)}), 500

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