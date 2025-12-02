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

print("Checking avatars bucket configuration...")
try:
    buckets = supabase.storage.list_buckets()
    for bucket in buckets:
        if bucket.name == "avatars":
            print(f"Bucket 'avatars' found: {bucket}")
            print(f"  Public: {bucket.public}")
            
            # Try to list files in the bucket
            try:
                files = supabase.storage.from_("avatars").list()
                print(f"  Files count: {len(files)}")
                for f in files[:5]:  # Show first 5
                    print(f"    - {f}")
            except Exception as e:
                print(f"  Error listing files: {e}")
            break
except Exception as e:
    print(f"Error checking bucket: {e}")

print("\nChecking profiles table for avatar_url values...")
try:
    res = supabase.table("profiles").select("id, username, avatar_url").limit(5).execute()
    for profile in res.data:
        print(f"  User: {profile.get('username')} | avatar_url: {profile.get('avatar_url')}")
except Exception as e:
    print(f"Error: {e}")
