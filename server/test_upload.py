import os
from supabase import create_client

# Manually parse .env
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

supabase = create_client(url, key)

# Test uploading a simple file to the avatars bucket
print("Testing file upload to avatars bucket...")
test_content = b"Test avatar image content"
test_path = "test-user-id/test-upload.txt"

try:
    result = supabase.storage.from_("avatars").upload(test_path, test_content, {
        "content-type": "text/plain",
        "upsert": True
    })
    print(f"Upload successful: {result}")
    
    # Try to get public URL
    public_url = supabase.storage.from_("avatars").get_public_url(test_path)
    print(f"Public URL: {public_url}")
    
    # Clean up test file
    supabase.storage.from_("avatars").remove([test_path])
    print("Test file removed successfully")
    
except Exception as e:
    print(f"Upload failed: {e}")
    import traceback
    traceback.print_exc()
