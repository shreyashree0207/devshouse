from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import supabase
from auth import verify_token
from typing import List, Optional
from datetime import datetime

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
async def create_update(data: UpdateCreate, user = Depends(verify_token)):
    """
    Saves an NGO proof update. Requires authentication and NGO ownership.
    Prevents 'Database integrity breach' and unauthorized posting.
    """
    # 1. Verify NGO ownership to fix 'Identifier Gap'
    user_id = user.get("user_id")
    account = supabase.table("ngo_accounts").select("id")\
        .eq("user_id", user_id)\
        .eq("ngo_id", data.ngo_id)\
        .eq("status", "approved")\
        .execute()
    
    if not account.data:
        # Fallback for demo: if user registered it, let them update
        # In production, only approved accounts should post
        ngo_owner = supabase.table("ngos").select("id").eq("id", data.ngo_id).eq("registered_by", user_id).execute()
        if not ngo_owner.data:
            raise HTTPException(status_code=403, detail="Access Denied: You are not authorized to post updates for this NGO")
    
    # 2. Validate NGO exists
    ngo_res = supabase.table("ngos").select("*").eq("id", data.ngo_id).execute()
    if not ngo_res.data:
        raise HTTPException(status_code=404, detail="Identifier Gap: NGO not found")
    
    ngo = ngo_res.data[0]

    # 3. Insert update
    update_data = {
        "ngo_id": data.ngo_id,
        "title": data.title,
        "description": data.description,
        "image_url": data.image_url,
        "ai_score": data.ai_score,
        "ai_verdict": data.ai_verdict,
        "labels": data.labels,
        "duplicate_flag": data.duplicate_flag,
        "community_ticks": 0,
        "uploaded_by": user_id
    }
    
    res = supabase.table("ngo_updates").insert(update_data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Database integrity error: Failed to save update")
    
    inserted_update = res.data[0]

    # 4. Update parent NGO metrics
    new_verified_proofs = (ngo.get("verified_proofs") or 0) + (1 if data.ai_score >= 70 else 0)
    new_total_updates = (ngo.get("total_updates") or 0) + 1
    
    # Update transparency score based on AI fidelity
    old_score = ngo.get("transparency_score") or 50
    new_score = min(100, (old_score + data.ai_score) // 2) if data.ai_score > 0 else old_score

    supabase.table("ngos").update({
        "latest_image_url": data.image_url,
        "latest_project_description": data.description,
        "total_updates": new_total_updates,
        "verified_proofs": new_verified_proofs,
        "transparency_score": new_score,
        "last_proof_at": datetime.utcnow().isoformat()
    }).eq("id", data.ngo_id).execute()

    return {"ok": True, "update": inserted_update}

@router.post("/{update_id}/community-confirm")
async def confirm_update(update_id: str, user = Depends(verify_token)):
    """
    Allows community members to upvote/confirm an update.
    """
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
    
    # 3. Prevent self-confirmation if possible (optional logic)
    # if target_update.get("uploaded_by") == user.get("user_id"):
    #     raise HTTPException(status_code=400, detail="Database integrity: You cannot confirm your own update")

    # 4. Increment
    update_res = supabase.table("ngo_updates").update({
        "community_ticks": current_ticks + 1
    }).eq("id", real_update_id).execute()
    
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Database integrity error: Failed to update ticks")
        
    return update_res.data[0]


