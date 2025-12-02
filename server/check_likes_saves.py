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

print("Checking for likes and saves tables...")
try:
    # Try to query likes table
    likes_res = supabase.table("likes").select("*").limit(1).execute()
    print(f"'likes' table exists. Sample columns: {list(likes_res.data[0].keys()) if likes_res.data else 'no data'}")
except Exception as e:
    print(f"'likes' table check: {e}")

try:
    # Try to query saves table  
    saves_res = supabase.table("saves").select("*").limit(1).execute()
    print(f"'saves' table exists. Sample columns: {list(saves_res.data[0].keys()) if saves_res.data else 'no data'}")
except Exception as e:
    print(f"'saves' table check: {e}")

try:
    # Try to query saved_artworks table
    saved_res = supabase.table("saved_artworks").select("*").limit(1).execute()
    print(f"'saved_artworks' table exists. Sample columns: {list(saved_res.data[0].keys()) if saved_res.data else 'no data'}")
except Exception as e:
    print(f"'saved_artworks' table check: {e}")

try:
    # Try to query liked_artworks table  
    liked_res = supabase.table("liked_artworks").select("*").limit(1).execute()
    print(f"'liked_artworks' table exists. Sample columns: {list(liked_res.data[0].keys()) if liked_res.data else 'no data'}")
except Exception as e:
    print(f"'liked_artworks' table check: {e}")
