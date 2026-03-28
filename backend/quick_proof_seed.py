from database import supabase
import datetime

def seed_some_proofs():
    # Fetch some NGOs
    res = supabase.table("ngos").select("id").limit(5).execute()
    if not res.data:
        print("No NGOs to seed proofs for")
        return
    
    for ngo in res.data:
        ngo_id = ngo["id"]
        update = {
            "ngo_id": ngo_id,
            "title": "On-field Impact Recorded",
            "description": "Evidence of field activity uploaded and verified via AI.",
            "image_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
            "ai_score": 90,
            "ai_verdict": "Verified by AI audit.",
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        try:
            # Try both tables!
            supabase.table("ngo_updates").insert(update).execute()
            print(f"Added proof to ngo_updates for {ngo_id}")
        except:
            try:
                supabase.table("proof_updates").insert(update).execute()
                print(f"Added proof to proof_updates for {ngo_id}")
            except Exception as e:
                print(f"Failed both! {e}")

if __name__ == "__main__":
    seed_some_proofs()
