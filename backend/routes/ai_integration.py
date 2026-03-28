"""
Standardized AI Verification & Impact Router — Unifies all platform intelligence features.
Categories:
1. Multi-layer Image Verification (Gemini + pHashing)
2. Impact Prediction (Claude Haiku)
3. Transparency Scoring (Heuristic Analysis)
4. Crowd Consensus Voting
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import json
import base64

from database import supabase
from ai.image_verify import verify_single_image, verify_before_after, check_suspicious_patterns
from ai.impact import predict_impact
from ai.transparency import compute_score, combined_trust_score

router = APIRouter(prefix="/api/v1/ai", tags=["AI & Verification"])

# --- Models ---
class VerifyUrlRequest(BaseModel):
    image_url: str
    project_description: str
    ngo_city: Optional[str] = "Tamil Nadu"

class ImpactRequest(BaseModel):
    amount: int
    category: str
    ngo_name: str

class VoteRequest(BaseModel):
    proof_id: str
    voter_id: str
    vote: str # 'genuine' or 'fake'

class ScoreRequest(BaseModel):
    milestones_done: int
    milestones_total: int
    verified_proofs: int
    total_updates: int
    returning_donors: int
    total_donors: int

# --- 1. Multi-Layer Image Verification ---

@router.post("/verify-file")
async def verify_image_file(
    file: UploadFile = File(...),
    description: str = Form(""),
    ngo_id: str = Form(""),
    ngo_city: str = Form("Tamil Nadu"),
    ngo_state: str = Form("Tamil Nadu"),
    submitted_lat: float = Form(0),
    submitted_lng: float = Form(0),
    ngo_lat: float = Form(0),
    ngo_lng: float = Form(0),
):
    """Deep analysis of an uploaded proof image with duplicate detection."""
    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"
    
    result = verify_single_image(
        image_data=image_bytes,
        mime_type=mime_type,
        project_description=description,
        ngo_city=ngo_city,
        ngo_state=ngo_state,
        submitted_lat=submitted_lat,
        submitted_lng=submitted_lng,
        ngo_lat=ngo_lat,
        ngo_lng=ngo_lng,
    )
    
    # Check for suspicious patterns if ngo_id provided
    if ngo_id:
        recent = supabase.table("proof_updates").select("*").eq("ngo_id", ngo_id).limit(10).execute().data or []
        suspicious = check_suspicious_patterns(ngo_id, recent, ngo_city)
        result["suspicious_activity"] = suspicious
        
    return result

@router.post("/verify")
async def verify_json(req: VerifyUrlRequest):
    """
    JSON-compatible endpoint for existing UI (NGO dashboard).
    Handles base64 input for rapid integration.
    """
    try:
        if req.image_url.startswith('data:image'):
            # It's a base64 string
            header, encoded = req.image_url.split(',', 1)
            mime_type = header.split(':')[1].split(';')[0]
            image_bytes = base64.b64decode(encoded)
        else:
            # It's a URL
            import urllib.request
            resp = urllib.request.urlopen(req.image_url)
            image_bytes = resp.read()
            mime_type = resp.headers.get('content-type', 'image/jpeg')

        result = verify_single_image(
            image_data=image_bytes,
            mime_type=mime_type,
            project_description=req.project_description,
            ngo_city=req.ngo_city or "Tamil Nadu"
        )
        
        # Format response for the NGO dashboard UI specifically if needed
        # The dashboard expects { score, label, verdict, is_original }
        return {
            "score": result.get("overall_trust_score", 0),
            "label": result.get("verdict", "REJECTED"),
            "verdict": result.get("verdict_reason", ""),
            "is_original": not result.get("duplicate_check", {}).get("is_duplicate", False),
            **result # include full report too
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-before-after")
async def verify_progress(
    before_file: UploadFile = File(...),
    after_file: UploadFile = File(...),
    description: str = Form(""),
    ngo_city: str = Form(""),
):
    """Validate progress between two photo states."""
    b_bytes = await before_file.read()
    a_bytes = await after_file.read()
    
    return verify_before_after(
        before_data=b_bytes, before_mime=before_file.content_type or "image/jpeg",
        after_data=a_bytes, after_mime=after_file.content_type or "image/jpeg",
        project_description=description,
        ngo_city=ngo_city
    )

# --- 2. Impact & Health Metrics ---

@router.post("/impact")
async def get_impact_sentence(req: ImpactRequest):
    """Generate a catchy, emotional impact sentence using AI."""
    try:
        impact = predict_impact(req.amount, req.category, req.ngo_name)
        return {"impact": impact}
    except Exception as e:
        # Fallback to local logic if AI unavailable
        return {"impact": f"₹{req.amount} will directly support the {req.category} initiatives of {req.ngo_name}."}

@router.get("/ngo-health/{ngo_id}")
async def get_ngo_health(ngo_id: str):
    """Real-time health monitoring for an NGO based on verification activity."""
    # Data aggregation logic
    milestones = supabase.table("milestones").select("status").eq("ngo_id", ngo_id).execute().data or []
    proofs = supabase.table("proof_updates").select("overall_trust_score").eq("ngo_id", ngo_id).execute().data or []
    
    done = sum(1 for m in milestones if m["status"] == "completed")
    total = len(milestones)
    verified = sum(1 for p in proofs if p.get("overall_trust_score", 0) >= 70)
    
    score = compute_score(done, total, verified, len(proofs), 5, 10) # Mock donor stats
    
    return {
        "ngo_id": ngo_id,
        "transparency_score": score,
        "health_status": "Healthy" if score > 75 else "At Risk" if score < 50 else "Watchlist",
        "milestone_progress": f"{done}/{total}",
        "verification_rate": f"{round((verified/len(proofs))*100, 1)}%" if proofs else "0%"
    }

# --- 3. Crowd Consensus ---

@router.post("/crowd-vote")
async def cast_vote(body: VoteRequest):
    """Record community trust feedback on a proof."""
    res = supabase.table("crowd_votes").insert({
        "proof_id": body.proof_id,
        "voter_id": body.voter_id,
        "vote": body.vote
    }).execute()
    return {"success": True, "message": "Vote recorded. Thank you for securing Sustainify!"}

@router.get("/transparency-score/{ngo_id}")
async def get_total_transparency(ngo_id: str):
    """Calculates a blended transparency score (AI 70% + Crowd 30%)."""
    proofs = supabase.table("proof_updates").select("overall_trust_score, id").eq("ngo_id", ngo_id).execute().data or []
    if not proofs:
        return {"score": 50, "status": "New Participant", "breakdown": "No data yet"}
    
    avg_ai = sum(p.get("overall_trust_score", 50) for p in proofs) / len(proofs)
    
    # Get crowd consensus
    votes = supabase.table("crowd_votes").select("vote").in_("proof_id", [p["id"] for p in proofs]).execute().data or []
    upvotes = sum(1 for v in votes if v["vote"] == "genuine")
    attestations = len(set(v.get("voter_id") for v in votes))
    
    blended = combined_trust_score(int(avg_ai), attestations, upvotes)
    
    return {
        "score": blended["total"],
        "ai_score": blended["ai_contribution"],
        "crowd_score": blended["community_contribution"],
        "status": "Elite Transparency" if blended["total"] > 90 else "Trusted" if blended["total"] > 70 else "Review Needed"
    }
