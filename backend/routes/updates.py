from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db_client import supabase
from typing import List, Optional

router = APIRouter(prefix="/updates", tags=["Updates"])

class UpdateCreate(BaseModel):
    ngo_id: str
    title: str
    description: str
    image_url: str
    ai_score: int = 0
    ai_verdict: str = ""
    labels: List[str] = []
    image_hash: Optional[str] = None
    duplicate_flag: bool = False

@router.post("")
async def create_update(data: UpdateCreate):
    # 1. Validate NGO exists
    ngo_res = supabase.table("ngos").select("*").eq("id", data.ngo_id).execute()
    if not ngo_res.data:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    ngo = ngo_res.data[0]

    # 2. Insert update
    update_data = {
        "ngo_id": data.ngo_id,
        "title": data.title,
        "description": data.description,
        "image_url": data.image_url,
        "ai_score": data.ai_score,
        "ai_verdict": data.ai_verdict,
        "labels": data.labels,
        "duplicate_flag": data.duplicate_flag,
        "community_ticks": 0
    }
    
    res = supabase.table("ngo_updates").insert(update_data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to save update")
    
    inserted_update = res.data[0]

    # 3. Update parent NGO
    new_verified_proofs = (ngo.get("verified_proofs") or 0) + (1 if data.ai_score >= 70 else 0)
    new_total_updates = (ngo.get("total_updates") or 0) + 1
    
    supabase.table("ngos").update({
        "latest_image_url": data.image_url,
        "latest_project_description": data.description,
        "total_updates": new_total_updates,
        "verified_proofs": new_verified_proofs
    }).eq("id", data.ngo_id).execute()

    # 4. Save image hash to fingerprints if provided
    if data.image_hash:
        try:
            supabase.table("proof_fingerprints").insert({
                "ngo_id": data.ngo_id,
                "update_id": inserted_update["id"],
                "image_hash": data.image_hash
            }).execute()
        except:
            # Duplicate hashes might fail insert depending on constraints
            pass

    return {"ok": True, "update": inserted_update}

@router.post("/{update_id}/community-confirm")
async def confirm_update(update_id: str):
    # 1. Try to find the exact update
    res = supabase.table("ngo_updates").select("*").eq("id", update_id).execute()
    
    # 2. If not found, it might be an NGO ID from the feed demo
    if not res.data:
        res = supabase.table("ngo_updates").select("*").eq("ngo_id", update_id).order("created_at", desc=True).limit(1).execute()
        
    if not res.data:
        raise HTTPException(status_code=404, detail="Update or NGO activities not found")
    
    target_update = res.data[0]
    real_update_id = target_update["id"]
    current_ticks = target_update.get("community_ticks") or 0
    
    # Increment
    update_res = supabase.table("ngo_updates").update({
        "community_ticks": current_ticks + 1
    }).eq("id", real_update_id).execute()
    
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to update ticks")
        
    return update_res.data[0]

