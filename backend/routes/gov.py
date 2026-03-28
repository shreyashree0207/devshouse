from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db_client import supabase
from typing import List, Optional

router = APIRouter(prefix="/gov", tags=["Government"])

class DocRequest(BaseModel):
    reason: str
    document_types: List[str] = ["Audit Report", "Financial Transparency"]

@router.get("/ngos")
async def get_all_ngos():
    res = supabase.table("ngos").select("*").order("created_at", desc=True).execute()
    if not res.data:
        return []
    return res.data

@router.post("/ngos/{ngo_id}/verify")
async def verify_ngo(ngo_id: str):
    res = supabase.table("ngos").update({
        "verified": True,
        "blacklisted": False,
        "gov_points": supabase.table("ngos").select("gov_points").eq("id", ngo_id).execute().data[0].get("gov_points", 0) + 10
    }).eq("id", ngo_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    # Optional: Log action
    try:
        supabase.table("gov_actions").insert({
            "ngo_id": ngo_id,
            "action_type": "VERIFY",
            "details": "Government oversight verified high transparency status."
        }).execute()
    except: pass
    
    return res.data[0]

@router.post("/ngos/{ngo_id}/blacklist")
async def blacklist_ngo(ngo_id: str):
    res = supabase.table("ngos").update({
        "blacklisted": True,
        "verified": False,
        "gov_points": max(0, supabase.table("ngos").select("gov_points").eq("id", ngo_id).execute().data[0].get("gov_points", 0) - 20)
    }).eq("id", ngo_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    # Optional: Log action
    try:
        supabase.table("gov_actions").insert({
            "ngo_id": ngo_id,
            "action_type": "BLACKLIST",
            "details": "NGO suspended due to audit failure."
        }).execute()
    except: pass
    
    return res.data[0]

@router.post("/ngos/{ngo_id}/reinstate")
async def reinstate_ngo(ngo_id: str):
    res = supabase.table("ngos").update({
        "blacklisted": False,
        "verified": True
    }).eq("id", ngo_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    return res.data[0]

@router.post("/ngos/{ngo_id}/request-documents")
async def request_documents(ngo_id: str, data: DocRequest):
    # 1. Update NGO state
    res = supabase.table("ngos").update({
        "pending_doc_request": True,
        "doc_request_reason": data.reason
    }).eq("id", ngo_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    # 2. Log requested documents to separate table
    request_data = {
        "ngo_id": ngo_id,
        "reason": data.reason,
        "document_types": data.document_types,
        "status": "PENDING"
    }
    
    req_res = supabase.table("gov_document_requests").insert(request_data).execute()
    if not req_res.data:
        raise HTTPException(status_code=500, detail="Failed to create document request log")
        
    return req_res.data[0]

@router.get("/requests/{ngo_id}")
async def get_ngo_requests(ngo_id: str):
    res = supabase.table("gov_document_requests").select("*").eq("ngo_id", ngo_id).order("created_at", desc=True).execute()
    if not res.data:
        return []
    return res.data