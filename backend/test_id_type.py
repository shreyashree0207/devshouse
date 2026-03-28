from database import supabase
import json

try:
    # Try to insert one of the demo ngos with the slug as ID
    ngo_data = {
        "id": "shiksha-foundation",
        "name": "Shiksha Foundation",
        "darpan_id": "MH/2018/0187432",
        "category": "Education",
        "city": "Chennai",
        "district": "Chennai"
    }
    res = supabase.table("ngos").upsert(ngo_data).execute()
    print("Successfully upserted with string ID")
except Exception as e:
    print(f"Error upserting with string ID: {e}")

res = supabase.table("ngos").select("*").limit(1).execute()
if res.data:
    print(f"Sample NGO ID: {res.data[0]['id']} (Type: {type(res.data[0]['id'])})")
