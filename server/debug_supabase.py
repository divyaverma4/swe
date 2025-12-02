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

if not url or not key:
    print("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    exit(1)

try:
    supabase = create_client(url, key)
except Exception as e:
    print(f"Error initializing client: {e}")
    exit(1)

print("Checking 'profiles' table columns...")
try:
    res = supabase.table("profiles").select("*").limit(1).execute()
    if res.data and len(res.data) > 0:
        print(f"Columns found: {list(res.data[0].keys())}")
        
        # Try to update the first profile found to test permissions/schema
        user_id = res.data[0]['id']
        print(f"Attempting to update profile for user_id: {user_id}")
        try:
            update_res = supabase.table("profiles").update({"bio": "Test bio update"}).eq("id", user_id).execute()
            print("Update successful:", update_res)
        except Exception as e:
            print(f"Update failed: {e}")
            
    else:
        print("No profiles found to inspect columns.")
except Exception as e:
    print(f"Error selecting from 'profiles': {e}")

print("\nChecking 'avatars' bucket...")
try:
    buckets = supabase.storage.list_buckets()
    found = False
    for b in buckets:
        if b.name == "avatars":
            found = True
            print("Bucket 'avatars' exists.")
            break
    if not found:
        print("Bucket 'avatars' does NOT exist.")
        # Try to create it
        print("Attempting to create 'avatars' bucket...")
        try:
            supabase.storage.create_bucket("avatars", options={"public": True})
            print("Successfully created 'avatars' bucket.")
        except Exception as e:
            print(f"Error creating 'avatars' bucket: {e}")

except Exception as e:
    print(f"Error listing buckets: {e}")
