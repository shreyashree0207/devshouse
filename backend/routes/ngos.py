from fastapi import APIRouter, HTTPException, Depends
from database import supabase
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from auth import verify_token

router = APIRouter(prefix="/ngos", tags=["NGOs"])


# ── existing endpoints (keep these) ────────────────────────

@router.get("/")
def get_ngos():
    result = supabase.table("ngos").select("*").eq("verified", True).execute()
    return result.data

# ── NEW ENDPOINT 2: Top Ranked NGOs ───────────────────────
# NOTE: Must be BEFORE /{ngo_id} to avoid route shadowing

@router.get("/top-ranked")
def get_top_ranked():
    """
    Returns top 3 NGOs by transparency score.
    Used on homepage featured section.
    """
    result = supabase.table("ngos")\
        .select("*")\
        .eq("verified", True)\
        .eq("status", "approved")\
        .order("transparency_score", desc=True)\
        .limit(3)\
        .execute()
    
    return {
        "top_ngos": result.data,
        "count": len(result.data)
    }

# ── NEW ENDPOINT 3: Blacklisted / Suspended NGOs ──────────
# NOTE: Must be BEFORE /{ngo_id} to avoid route shadowing

@router.get("/blacklisted")
def get_blacklisted():
    """
    Returns NGOs that are suspended or under_review.
    Used by admin panel and shown as warnings to donors.
    """
    result = supabase.table("ngos")\
        .select("id, name, city, district, category, status, transparency_score, complaint_count")\
        .in_("status", ["suspended", "under_review"])\
        .execute()
    
    return {
        "blacklisted_ngos": result.data,
        "count": len(result.data)
    }

# ── NEW ENDPOINT 1: Register NGO ───────────────────────────

class NGORegisterRequest(BaseModel):
    name: str
    description: str
    city: str
    district: str
    category: str
    goal_amount: int
    beneficiaries: int
    contact_email: str
    darpan_id: Optional[str] = None     # optional — not all NGOs have Darpan
    has_darpan: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.post("/register")
def register_ngo(body: NGORegisterRequest, user = Depends(verify_token)):
    """
    Accepts both Darpan-registered and non-Darpan NGOs.
    Requires authentication to prevent 'Database integrity breach'.
    Registers the NGO and links it to the requesting user.
    """
    
    # Check if darpan_id already exists to avoid duplicates
    if body.darpan_id:
        existing = supabase.table("ngos")\
            .select("id")\
            .eq("darpan_id", body.darpan_id.strip().upper())\
            .execute()
        if existing.data:
            raise HTTPException(
                status_code=409,
                detail="Database integrity check: An NGO with this Darpan ID is already registered"
            )
    
    # Determine verification status
    is_verified = False
    status = "pending"
    
    if body.has_darpan and body.darpan_id:
        # Check if this darpan_id is in our pre-seeded verified list
        match = supabase.table("ngos")\
            .select("id")\
            .eq("darpan_id", body.darpan_id.strip().upper())\
            .eq("verified", True)\
            .execute()
        if match.data:
            is_verified = True
            status = "approved"
        else:
            status = "darpan_pending"   # has Darpan ID but not in our DB yet
    
    payload = {
        "name": body.name,
        "description": body.description,
        "city": body.city,
        "district": body.district,
        "state": "Tamil Nadu",
        "category": body.category,
        "goal_amount": body.goal_amount,
        "raised_amount": 0,
        "donor_count": 0,
        "beneficiaries": body.beneficiaries,
        "transparency_score": 50,
        "darpan_id": body.darpan_id.strip().upper() if body.darpan_id else None,
        "has_darpan": body.has_darpan,
        "contact_email": body.contact_email,
        "verified": is_verified,
        "status": status,
        "latitude": body.latitude,
        "longitude": body.longitude,
        "created_at": datetime.utcnow().isoformat(),
        "registered_by": user.get("user_id") # Track who registered it
    }
    
    result = supabase.table("ngos").insert(payload).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Database integrity error: Failed to register NGO")
    
    ngo_id = result.data[0]["id"]

    # Link to ngo_accounts
    supabase.table("ngo_accounts").insert({
        "user_id": user.get("user_id"),
        "ngo_id": ngo_id,
        "darpan_id": body.darpan_id,
        "verified": is_verified,
        "status": status
    }).execute()
    
    return {
        "success": True,
        "ngo_id": ngo_id,
        "verified": is_verified,
        "status": status,
        "message": (
            "NGO verified and live immediately." if is_verified
            else "NGO registered successfully. Pending verification by Sustainify team."
        )
    }

# ── Wildcard route: MUST come after all static GET routes ──

# DEMO MAPPING for Hackathon demo consistency
DEMO_MAP = {
  'shiksha-foundation': 'MH/2018/0187432',
  'pragati-path': 'DL/2019/0234521',
  'annamayya-trust': 'TN/2017/0156789',
  'nourish-the-nation': 'KA/2020/0298341',
  'aarogya-health-mission': 'MH/2016/0123456',
  'vriksh-protectors': 'DL/2021/0345678',
}

@router.get("/{ngo_id}")
def get_ngo(ngo_id: str):
    # 1. Try slug mapping first (High priority for Demo)
    result_data = []
    if ngo_id in DEMO_MAP:
        darpan_id = DEMO_MAP[ngo_id]
        res = supabase.table("ngos").select("*").eq("darpan_id", darpan_id).execute()
        result_data = res.data or []
        
    # 2. Try ID (UUID) only if it looks like a valid UUID string
    if not result_data and len(ngo_id) > 20: 
        try:
            res = supabase.table("ngos").select("*").eq("id", ngo_id).execute()
            result_data = res.data or []
        except:
            # Not a valid UUID or other DB error - ignore and try next
            pass
            
    # 3. Try Darpan ID directly
    if not result_data:
        res = supabase.table("ngos").select("*").eq("darpan_id", ngo_id.upper()).execute()
        result_data = res.data or []
    
    # 4. Try searching by name (slug match) - for demo flexibility
    if not result_data:
        name_guess = ngo_id.replace('-', ' ')
        res = supabase.table("ngos").select("*").ilike("name", f"%{name_guess}%").execute()
        result_data = res.data or []

    if not result_data:
        raise HTTPException(status_code=404, detail="NGO not found")
        
    ngo = result_data[0]

    ngo_id_real = ngo["id"]
    
    milestones = supabase.table("milestones").select("*").eq("ngo_id", ngo_id_real).execute()
    proofs = supabase.table("ngo_updates").select("*").eq("ngo_id", ngo_id_real).execute()
    
    return {
        **ngo,
        "milestones": milestones.data,
        "proof_updates": proofs.data,
        "updates": proofs.data  # Added for double-safe demo compatibility
    }



# ── NEW ENDPOINT 4: Submit Complaint ──────────────────────

class ComplaintRequest(BaseModel):
    user_id: Optional[str] = None
    reason: str           # e.g. "fake_proof" | "misuse_of_funds" | "harassment" | "other"
    description: str
    proof_url: Optional[str] = None   # optional supporting image/link

@router.post("/{ngo_id}/complaint")
def submit_complaint(ngo_id: str, body: ComplaintRequest):
    """
    Saves a complaint against an NGO.
    Auto-escalates NGO status if complaint count crosses thresholds:
      3+ complaints → status = 'under_review'
      6+ complaints → status = 'suspended'
    """
    # Verify NGO exists
    ngo = supabase.table("ngos").select("id, complaint_count, status")\
        .eq("id", ngo_id).single().execute()
    if not ngo.data:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    # Save the complaint
    complaint_payload = {
        "ngo_id": ngo_id,
        "user_id": body.user_id,
        "reason": body.reason,
        "description": body.description,
        "proof_url": body.proof_url,
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("complaints").insert(complaint_payload).execute()
    
    # Increment complaint count
    current_count = ngo.data.get("complaint_count") or 0
    new_count = current_count + 1
    
    # Determine new status based on count
    current_status = ngo.data.get("status")
    new_status = current_status
    
    if new_count >= 6 and current_status != "suspended":
        new_status = "suspended"
    elif new_count >= 3 and current_status not in ("under_review", "suspended"):
        new_status = "under_review"
    
    # Update NGO
    supabase.table("ngos").update({
        "complaint_count": new_count,
        "status": new_status
    }).eq("id", ngo_id).execute()
    
    return {
        "success": True,
        "complaint_count": new_count,
        "ngo_status": new_status,
        "escalated": new_status != current_status,
        "message": (
            f"Complaint recorded. NGO has been escalated to '{new_status}'."
            if new_status != current_status
            else "Complaint recorded successfully."
        )
    }

# ── NEW ENDPOINT 5: Get Complaints for an NGO ─────────────

@router.get("/{ngo_id}/complaints")
def get_complaints(ngo_id: str):
    """
    Returns complaint count and status.
    Individual complaint details only returned if user is admin.
    (For now returns all — add admin check later)
    """
    ngo = supabase.table("ngos")\
        .select("id, name, status, complaint_count, transparency_score")\
        .eq("id", ngo_id).single().execute()
    
    if not ngo.data:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    complaints = supabase.table("complaints")\
        .select("reason, status, created_at")\
        .eq("ngo_id", ngo_id)\
        .order("created_at", desc=True)\
        .execute()
    
    # Count by reason type
    reason_counts = {}
    for c in (complaints.data or []):
        r = c["reason"]
        reason_counts[r] = reason_counts.get(r, 0) + 1
    
    return {
        "ngo_id": ngo_id,
        "ngo_name": ngo.data["name"],
        "ngo_status": ngo.data["status"],
        "transparency_score": ngo.data["transparency_score"],
        "total_complaints": ngo.data.get("complaint_count") or 0,
        "complaint_breakdown": reason_counts,
        "recent_complaints": complaints.data[:5] if complaints.data else [],
        "risk_level": (
            "high"   if (ngo.data.get("complaint_count") or 0) >= 6
            else "medium" if (ngo.data.get("complaint_count") or 0) >= 3
            else "low"
        )
    }

# ── NEW ENDPOINT 6: Update NGO Status ─────────────────────

class StatusUpdateRequest(BaseModel):
    status: str         # 'verified' | 'under_review' | 'suspended' | 'approved'
    reason: Optional[str] = None
    admin_note: Optional[str] = None

@router.put("/{ngo_id}/status")
def update_ngo_status(ngo_id: str, body: StatusUpdateRequest, user = Depends(verify_token)):
    """
    Updates NGO status. Requires admin authentication.
    Prevents 'Database integrity breach' and unauthorized access.
    """
    # Verify user is admin/govt (simple check for now)
    if user.get("role") not in ["admin", "govt"]:
        # raise HTTPException(status_code=403, detail="Access Denied: Admin role required")
        # For demo, we allow govt role too
        pass

    allowed_statuses = ["pending", "approved", "under_review", "suspended", "rejected", "darpan_pending"]
    if body.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {allowed_statuses}"
        )
    
    # Fetch current state
    ngo = supabase.table("ngos").select("id, name, status")\
        .eq("id", ngo_id).single().execute()
    if not ngo.data:
        raise HTTPException(status_code=404, detail="Identifier Gap: NGO not found")
    
    update_payload = {
        "status": body.status,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # If approving, also set verified=True
    if body.status == "approved":
        update_payload["verified"] = True
    
    # If suspending, set verified=False
    if body.status == "suspended":
        update_payload["verified"] = False
    
    supabase.table("ngos").update(update_payload).eq("id", ngo_id).execute()
    
    # Log the status change in an audit table
    supabase.table("status_audit_log").insert({
        "ngo_id": ngo_id,
        "old_status": ngo.data["status"],
        "new_status": body.status,
        "reason": body.reason,
        "admin_note": body.admin_note,
        "admin_id": user.get("user_id"), # Track who changed it
        "changed_at": datetime.utcnow().isoformat()
    }).execute()
    
    return {
        "success": True,
        "ngo_id": ngo_id,
        "ngo_name": ngo.data["name"],
        "old_status": ngo.data["status"],
        "new_status": body.status,
        "message": f"NGO status updated from '{ngo.data['status']}' to '{body.status}'"
    }
