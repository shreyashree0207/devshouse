from database import supabase
import json

MOCK_IDS = [
    'MH/2018/0187432',
    'TN/2017/0156789',
    'MH/2016/0123456',
    'DL/2021/0345678'
]

try:
    # 1. Fetch current NGOs
    res = supabase.table("ngos").select("id").limit(4).execute()
    data = res.data or []
    print(f"Assigning DARPAN IDs to {len(data)} NGOs...")
    
    for i, ngo in enumerate(data):
        target_id = MOCK_IDS[i]
        ngo_id = ngo['id']
        upd = supabase.table("ngos").update({
            "darpan_id": target_id,
            "verified": True,
            "status": "approved"
        }).eq("id", ngo_id).execute()
        print(f"Updated {ngo_id} -> {target_id}: Result: {'Success' if upd.data else 'Fail'}")
        
except Exception as e:
    print(f"Error: {e}")
