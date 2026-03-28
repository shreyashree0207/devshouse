from database import supabase
import json

try:
    res = supabase.table("ngos").select("*").execute()
    data = res.data or []
    print(f"Total NGOs count: {len(data)}")
    for ngo in data:
        print(f"{ngo.get('id')} | {ngo.get('name')} | Darpan: {ngo.get('darpan_id')}")
except Exception as e:
    print(f"Error: {e}")
