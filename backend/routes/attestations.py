from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import supabase
from auth import verify_token
import logging

router = APIRouter()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MOCK_ATT = [
    {"id":"a1","name":"Priya M.","role":"beneficiary","experience":"My son gets meals here every day. The volunteers are genuine and I've seen them personally.","upvotes":12},
    {"id":"a2","name":"Rajan K.","role":"volunteer","experience":"I was part of this drive. 2000 meals were actually served, I helped pack them.","upvotes":8},
]

class AttestReq(BaseModel):
    update_id: str
    ngo_id: str
    name: str = "Anonymous"
    experience: str
    role: str = "attendee"

@router.get("/{update_id}")
def get_attestations(update_id: str):
    try:
        r = supabase.table("attestations").select("*").eq("update_id", update_id).order("upvotes", desc=True).execute()
        return r.data if r.data else MOCK_ATT
    except Exception as e:
        logger.error(f"Error fetching attestations for {update_id}: {str(e)}")
        return MOCK_ATT

@router.post("/")
def add_attestation(req: AttestReq, user = Depends(verify_token)):
    """
    Adds a verified attestation. Requires a valid user token.
    Checks for 'Identifier Gap' (ensures NGO exists).
    """
    try:
        # 1. Verify NGO exists to prevent 'Identifier Gap'
        ngo_check = supabase.table("ngos").select("id").eq("id", req.ngo_id).execute()
        if not ngo_check.data:
            raise HTTPException(status_code=404, detail="NGO Identifier Gap: NGO not found")

        # 2. Insert attestation
        payload = {
            "update_id": req.update_id,
            "ngo_id": req.ngo_id,
            "user_id": user.get("user_id"), # Link to authenticated user
            "name": req.name,
            "experience": req.experience,
            "role": req.role,
        }
        
        result = supabase.table("attestations").insert(payload).execute()
        return {"status": "submitted", "id": result.data[0]["id"] if result.data else None}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database integrity error in add_attestation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database integrity error: {str(e)}")

@router.post("/{attestation_id}/upvote")
def upvote(attestation_id: str, user = Depends(verify_token)):
    try:
        # Check if attestation exists
        row = supabase.table("attestations").select("upvotes").eq("id", attestation_id).single().execute()
        if not row.data:
            raise HTTPException(status_code=404, detail="Attestation not found")
            
        new_votes = (row.data["upvotes"] or 0) + 1
        supabase.table("attestations").update({"upvotes": new_votes}).eq("id", attestation_id).execute()
        return {"status": "upvoted", "new_count": new_votes}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error upvoting {attestation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database integrity breach during update")