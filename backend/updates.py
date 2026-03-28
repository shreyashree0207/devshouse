from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import supabase

updates_router = APIRouter()

class ProofUpdatePayload(BaseModel):
    ngo_id: str
    title: str
    description: Optional[str] = ""
    image_url: str
    ai_score: Optional[int] = 0
    ai_verdict: Optional[str] = ""
    labels: Optional[List[str]] = []
    image_hash: Optional[str] = None
    duplicate_flag: Optional[bool] = False
    duplicate_ngos: Optional[List[str]] = []

@updates_router.post("/updates")
def create_update(payload: ProofUpdatePayload):
    # Insert proof update record
    result = supabase.table("proof_updates").insert({
        "ngo_id": payload.ngo_id,
        "title": payload.title,
        "description": payload.description,
        "image_url": payload.image_url,
        "ai_score": payload.ai_score,
        "ai_verdict": payload.ai_verdict,
        "labels": payload.labels,
    }).execute()

    # Store image fingerprint to detect duplicates in future
    if payload.image_hash:
        supabase.table("proof_fingerprints").insert({
            "ngo_id": payload.ngo_id,
            "image_hash": payload.image_hash,
            "image_url": payload.image_url,
        }).execute()

    # Fetch current NGO data
    ngo = supabase.table("ngos").select("*").eq("id", payload.ngo_id).execute()
    if not ngo.data:
        raise HTTPException(status_code=404, detail="NGO not found")

    current = ngo.data[0]
    total_updates = (current.get("total_updates") or 0) + 1
    verified_proofs = (current.get("verified_proofs") or 0) + (1 if payload.ai_score and payload.ai_score >= 65 else 0)

    supabase.table("ngos").update({
        "latest_image_url": payload.image_url,
        "latest_project_description": payload.description or payload.title,
        "total_updates": total_updates,
        "verified_proofs": verified_proofs,
    }).eq("id", payload.ngo_id).execute()

    return {"success": True, "update": result.data}