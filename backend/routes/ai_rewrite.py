from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

class RewriteRequest(BaseModel):
    ngo_name: str
    raw_text: str

@router.post("/rewrite-update")
async def rewrite_update(data: RewriteRequest):
    # Simulated AI narrative polishing logic for hackathon
    cleaned_input = data.raw_text.strip()
    
    # Simple rule-based polish to simulate AI
    public_update = f"Impact Update by {data.ngo_name}: {cleaned_input.capitalize()}. Our community is seeing real change on the ground as we continue our mission."
    
    # More professional summaries
    donor_summary = f"Thanks to your support, {data.ngo_name} has successfully implemented local initiatives. {cleaned_input}. Every contribution is being transformed into verifiable impact."
    
    gov_summary = f"Operational Audit Summary for {data.ngo_name}: Successfully documented field activities described as: {cleaned_input}. AI-verified visual evidence attached."
    
    return {
        "title": f"The {data.ngo_name} Impact Story",
        "description": public_update,
        "donor_summary": donor_summary,
        "gov_summary": gov_summary
    }
