import json
from main import get_ngos, get_ngo
from db_client import supabase

print("\n--- BEFORE ADDING ---")
ngos = get_ngos()
print(f"Total NGOs loaded: {len(ngos)}")
if len(ngos) > 0:
    for ngo in ngos:
        print(f" - {ngo['name']}")

extra_ngos = [
    {
        "id": 3,
        "name": "Sanjeevani Healthcare Network",
        "city": "Delhi",
        "category": "healthcare",
        "goal": 200000,
        "raised": 115000,
        "transparency_score": 92,
        "image_url": "https://picsum.photos/400/302"
    },
    {
        "id": 4,
        "name": "Nari Shakti Foundation",
        "city": "Bengaluru",
        "category": "women empowerment",
        "goal": 75000,
        "raised": 48000,
        "transparency_score": 89,
        "image_url": "https://picsum.photos/400/303"
    }
]

print("\n--- ADDING PRO-TIP NGOS ---")
for ngo in extra_ngos:
    try:
        supabase.table("ngos").insert(ngo).execute()
        print(f"✅ Added {ngo['name']}")
    except Exception as e:
        print(f"Skipped {ngo['name']}: {e}")

print("\n--- FINAL TEST ---")
final_ngos = get_ngos()
print(f"Total NGOs in your Hackathon DB right now: {len(final_ngos)}")
print("\n🎉 Your backend is ready! 🎉")
