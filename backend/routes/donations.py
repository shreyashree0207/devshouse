from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db_client import supabase

router = APIRouter(prefix="/donations", tags=["donations"])

class DonationRequest(BaseModel):
    ngo_id: str
    donor_name: str = "Anonymous"
    donor_email: str = ""
    amount: int
    anonymous: bool = False

def simple_impact_text(amount: int, category: str, ngo_name: str) -> str:
    if category.lower() == "environment":
        return f"Your ₹{amount} can support cleanup kits, waste collection and volunteer logistics for {ngo_name}."
    if category.lower() == "education":
        return f"Your ₹{amount} can help provide books, learning materials and tutoring support through {ngo_name}."
    if category.lower() == "healthcare":
        return f"Your ₹{amount} can support medicines, health camp materials and outreach logistics for {ngo_name}."
    return f"Your ₹{amount} can directly support verified work by {ngo_name}."

@router.post("")
def create_donation(req: DonationRequest):
    ngo_res = supabase.table("ngos").select("*").eq("id", req.ngo_id).execute()
    if not ngo_res.data:
        raise HTTPException(status_code=404, detail="NGO not found")

    ngo = ngo_res.data[0]
    impact = simple_impact_text(req.amount, ngo["category"], ngo["name"])

    donor_name = "Anonymous" if req.anonymous else req.donor_name

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
        "donor_name": donor_name,
        "donor_email": req.donor_email,
        "amount": req.amount,
        "anonymous": req.anonymous,
        "receipt_text": receipt,
        "impact_text": impact,
        "status": "completed"
    }

    inserted = supabase.table("donations").insert(payload).execute()

    return {
        "ok": True,
        "donation": inserted.data[0],
        "receipt": receipt,
        "impact": impact
    }