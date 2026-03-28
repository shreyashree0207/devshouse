from database import supabase
import datetime
import random

def seed_demo_data():
    # 1. Fetch the Shiksha Foundation NGO (if not exists, add it)
    res = supabase.table("ngos").select("id").eq("darpan_id", "MH/2018/0187432").execute()
    if not res.data:
        ngo_payload = {
            "name": "Shiksha Foundation",
            "darpan_id": "MH/2018/0187432",
            "category": "Education",
            "city": "Chennai",
            "district": "Chennai",
            "verified": True,
            "status": "approved",
            "description": "Empowering underprivileged children across Tamil Nadu melalui quality education.",
            "transparency_score": 87,
            "goal_amount": 500000,
            "raised_amount": 150000,
            "donor_count": 45,
            "beneficiaries": 200,
        }
        res = supabase.table("ngos").insert(ngo_payload).execute()
    
    ngo_id = res.data[0]["id"]
    print(f"NGO Shiksha Foundation ID: {ngo_id}")

    # 2. Add some updates for the ledger
    updates = [
        {
            "ngo_id": ngo_id,
            "title": "Textbook Distribution Drive",
            "description": "Distributed high-quality notebooks and stationery kits to 120 students in Salem district.",
            "image_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
            "ai_score": 92,
            "ai_verdict": "High fidelity image matching Class 6 curriculum distribution. Geotags confirmed.",
            "labels": ["Education", "Distribution", "Verified"],
            "community_ticks": 12,
            "created_at": datetime.datetime.utcnow().isoformat()
        },
        {
            "ngo_id": ngo_id,
            "title": "New Reading Corner Installed",
            "description": "Successfully set up a mini-library with 200+ books at the government high school.",
            "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200",
            "ai_score": 85,
            "ai_verdict": "Library furniture and books identified. Matches project proposal V2.",
            "labels": ["Library", "Infrastructure"],
            "community_ticks": 8,
            "created_at": (datetime.datetime.utcnow() - datetime.timedelta(days=2)).isoformat()
        }
    ]
    
    # Try inserting into both table names just in case! 
    # But NGOAdminDashboard mostly uses 'updates' or 'proof_updates' or 'ngo_updates' name in JSON
    # The actual table name seems to be 'ngo_updates' according to my routes.
    
    try:
        supabase.table("ngo_updates").insert(updates).execute()
        print("Inserted 2 updates into ngo_updates")
    except Exception as e:
        print(f"Error inserting into ngo_updates: {e}")

    # 3. Add some milestones
    milestones = [
        {"ngo_id": ngo_id, "title": "Buy 200 Textbooks", "description": "Phase 1: Procurement", "amount_locked": 50000, "status": "UNLOCKED"},
        {"ngo_id": ngo_id, "title": "Distribution Salem", "description": "Phase 2: Salem District", "amount_locked": 50000, "status": "IN_PROGRESS"},
        {"ngo_id": ngo_id, "title": "Library Setup", "description": "Phase 3: Final Infrastructure", "amount_locked": 100000, "status": "LOCKED"},
    ]
    try:
        # Check if milestones exist
        m_check = supabase.table("milestones").select("id").eq("ngo_id", ngo_id).execute()
        if not m_check.data:
            supabase.table("milestones").insert(milestones).execute()
            print("Inserted 3 milestones")
    except Exception as e:
        print(f"Error inserting milestones: {e}")

if __name__ == "__main__":
    seed_demo_data()
