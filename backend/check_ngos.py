from database import supabase
import json

try:
    if not supabase:
        print("Error: Supabase client not initialized")
    else:
        res = supabase.table("ngos").select("*").execute()
        print(f"Total NGOs: {len(res.data)}")
        for ngo in res.data:
            print(f" - {ngo['name']} (ID: {ngo['id']}, Darpan: {ngo.get('darpan_id')})")
except Exception as e:
    print(f"Error: {e}")
