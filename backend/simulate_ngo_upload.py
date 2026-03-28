from supabase import create_client, Client
from datetime import datetime

url = "https://vzwavojjissjbxfaqkeg.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d2F2b2pqaXNzamJ4ZmFxa2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTczMTMsImV4cCI6MjA5MDE3MzMxM30.ILHIZwvlSI7cDQIwQf27QJvBcBuMmE16aEzoSHr3r4A"

supabase: Client = create_client(url, key)

def simulate_upload():
    print("Simulating NGO Proof Upload for Akshara Foundation...")
    
    # 1. Get the Akshara activity
    res = supabase.table("activities").select("id").eq("ngo_id", 1).limit(1).execute()
    activity = getattr(res, 'data', res)[0]
    
    # 2. Insert Proof Submission
    proof = {
        "activity_id": activity["id"],
        "ngo_id": 1,
        "after_image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200",
        "description": "Successfully distributed 100 library kits to kids in rural Salem hamlets.",
        "latitude": 11.6643,
        "longitude": 78.1460,
        "location_name": "Salem, TN",
        "device_timestamp": datetime.now().isoformat(),
        "reverse_image_score": 98,
        "geotag_match_score": 100,
        "content_match_score": 95,
        "before_after_score": 92,
        "overall_trust_score": 96,
        "ai_verdict": "AUTHENTIC: Image confirms distribution of library materials at verified coordinates.",
        "ai_tags": ["education", "rural", "books", "distribution"],
        "status": "verified"
    }
    
    supabase.table("proof_submissions").insert(proof).execute()
    
    # 3. Update Activity Status & Release Donations
    supabase.table("activities").update({"status": "verified"}).eq("id", activity["id"]).execute()
    supabase.table("donations").update({"released": True}).eq("activity_id", activity["id"]).execute()
    
    print("✅ NGO Upload Simulated & Verified.")
    print(f"✅ Activity ID: {activity['id']}")
    print("✅ Funds Released.")

if __name__ == "__main__":
    simulate_upload()
