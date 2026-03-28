from supabase import create_client, Client
import random
from datetime import datetime, timedelta

# Hardcoded keys for internal seed (verified from .env.local)
url = "https://vzwavojjissjbxfaqkeg.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d2F2b2pqaXNzamJ4ZmFxa2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTczMTMsImV4cCI6MjA5MDE3MzMxM30.ILHIZwvlSI7cDQIwQf27QJvBcBuMmE16aEzoSHr3r4A"

supabase: Client = create_client(url, key)

def seed_activities():
    print("Initiating Activity Seed Protocol...")
    
    # 1. Fetch NGOs
    res = supabase.table("ngos").select("id, name").execute()
    print(f"Debug: Response type: {type(res)}")
    
    # Safely extract data
    ngos = []
    if hasattr(res, 'data'):
        ngos = res.data
    else:
        # Some versions return raw list
        ngos = res

    if not ngos:
        print("Error: No NGOs found. Seeding aborted.")
        return

    print(f"Linking missions to {len(ngos)} verified institutions.")
    
    missions = [
        {"t": "Digital Literacy Camp", "c": "Education", "d": "Providing 50 tablets and localized learning materials for standard 6-8 students."},
        {"t": "Safe Water Initiative", "c": "Health", "d": "Installing 3 community-grade reverse osmosis filters in drought-hit hamlets."},
        {"t": "Reforestation Phase II", "c": "Environment", "d": "Planting 200 native saplings with geotagged monitoring and protection."},
        {"t": "Mobile Clinic Deployment", "c": "Health", "d": "Equipping a mobile van with diagnostic tools for remote tribal clinics."}
    ]

    activities = []
    for ngo in ngos:
        selected = random.sample(missions, random.randint(1, 2))
        for m in selected:
            target = random.choice([15000, 35000, 75000, 120000])
            raised = random.randint(0, target)
            
            activity = {
                "ngo_id": ngo["id"],
                "title": f"{ngo['name']}: {m['t']}",
                "description": m["d"],
                "category": m["c"],
                "target_amount": target,
                "raised_amount": raised,
                "donor_count": random.randint(3, 15),
                "status": "fundraising",
                "before_image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
                "deadline": (datetime.now() + timedelta(days=25)).strftime("%Y-%m-%d"),
                "location_name": "Salem, Tamil Nadu"
            }
            activities.append(activity)

    try:
        supabase.table("activities").insert(activities).execute()
        print(f"MISSION SUCCESS: {len(activities)} activities deployed in escrow.")
    except Exception as e:
        print(f"MISSION FAILED: {e}")

if __name__ == "__main__":
    seed_activities()
