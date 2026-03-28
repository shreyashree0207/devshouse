from database import supabase
import json

tables = ["ngos", "ngo_updates", "proof_updates", "milestones"]
for t in tables:
    try:
        res = supabase.table(t).select("count", count="exact").execute()
        print(f"Table {t}: {res.count} records")
    except Exception as e:
        print(f"Table {t} Error: {e}")
