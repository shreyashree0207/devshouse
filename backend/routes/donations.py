from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import supabase
from auth import verify_token
from typing import Optional

router = APIRouter(prefix="/donations", tags=["donations"])

class DonationRequest(BaseModel):
    ngo_id: str
    donor_name: str = "Anonymous"
    donor_email: str = ""
    amount: int
    anonymous: bool = False
    user_id: Optional[str] = None # Added for user tracking

def simple_impact_text(amount: int, category: str, ngo_name: str) -> str:
    cat = category.lower() if category else ""
    if cat == "environment":
        return f"Your ₹{amount} can support cleanup kits, waste collection and volunteer logistics for {ngo_name}."
    if cat == "education":
        return f"Your ₹{amount} can help provide books, learning materials and tutoring support through {ngo_name}."
    if cat == "healthcare":
        return f"Your ₹{amount} can support medicines, health camp materials and outreach logistics for {ngo_name}."
    return f"Your ₹{amount} can directly support verified work by {ngo_name}."

@router.post("")
def create_donation(req: DonationRequest, user = Depends(verify_token)):
    """
    Creates a donation record and updates NGO total raised.
    Requires authentication to prevent 'Database integrity breach'.
    """
    # 1. Fetch NGO info
    ngo_res = supabase.table("ngos").select("id, name, category, raised_amount, donor_count").eq("id", req.ngo_id).execute()
    if not ngo_res.data:
        raise HTTPException(status_code=404, detail="Identifier Gap: NGO not found")

    ngo = ngo_res.data[0]
    impact = simple_impact_text(req.amount, ngo.get("category", ""), ngo.get("name", "NGO"))

    donor_id = user.get("user_id")
    donor_name = "Anonymous" if req.anonymous else (req.donor_name or user.get("email", "Anonymous"))

    receipt = (
        f"Sustainify Donation Receipt\n"
        f"NGO: {ngo['name']}\n"
        f"Amount: ₹{req.amount}\n"
        f"Donor: {donor_name}\n"
        f"Category: {ngo['category']}\n"
        f"Impact Summary: {impact}\n"
        f"Status: completed"
    )

    payload = {
        "ngo_id": req.ngo_id,
        "user_id": donor_id, # Link donation to authenticated user
        "donor_name": donor_name,
        "donor_email": req.donor_email or user.get("email"),
        "amount": req.amount,
        "anonymous": req.anonymous,
        "receipt_text": receipt,
        "impact_text": impact,
        "status": "completed"
    }

    # 2. Insert donation record
    inserted = supabase.table("donations").insert(payload).execute()
    if not inserted.data:
        raise HTTPException(status_code=500, detail="Database integrity error: Failed to record donation")

    # 3. Update NGO raised amount and donor count
    new_raised_amount = (ngo.get("raised_amount") or 0) + req.amount
    new_donor_count = (ngo.get("donor_count") or 0) + 1
    
    supabase.table("ngos")\
        .update({"raised_amount": new_raised_amount, "donor_count": new_donor_count})\
        .eq("id", req.ngo_id)\
        .execute()

    # 4. Record in impact feed
    supabase.table("impact_feed").insert({
        "type": "donation",
        "user_id": donor_id,
        "user_name": donor_name,
        "ngo_id": req.ngo_id,
        "ngo_name": ngo["name"],
        "amount": req.amount,
        "category": ngo["category"],
        "message": f"{donor_name} supported {ngo['name']} with ₹{req.amount}. {impact}"
    }).execute()

    return {
        "ok": True,
        "donation": inserted.data[0],
        "receipt": receipt,
        "impact": impact
    }