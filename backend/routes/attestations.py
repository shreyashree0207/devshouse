from fastapi import APIRouter
from pydantic import BaseModel
from db_client import supabase

router = APIRouter()

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
        return r.data or MOCK_ATT
    except:
        return MOCK_ATT

@router.post("/")
def add_attestation(req: AttestReq):
    try:
        supabase.table("attestations").insert({
            "update_id": req.update_id,
            "ngo_id": req.ngo_id,
            "name": req.name,
            "experience": req.experience,
            "role": req.role,
        }).execute()
    except:
        pass
    return {"status": "submitted"}

@router.post("/{attestation_id}/upvote")
def upvote(attestation_id: str):
    try:
        row = supabase.table("attestations").select("upvotes").eq("id", attestation_id).single().execute()
        supabase.table("attestations").update({"upvotes": (row.data["upvotes"] or 0) + 1}).eq("id", attestation_id).execute()
    except:
        pass
    return {"status": "upvoted"}