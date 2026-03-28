# backend/ai/router.py
from fastapi import APIRouter
from pydantic import BaseModel
from .verify import verify_image
from .impact import predict_impact
from .transparency import compute_score

router = APIRouter()

class VerifyRequest(BaseModel):
    image_url: str
    project_description: str

class ImpactRequest(BaseModel):
    amount: int
    category: str
    ngo_name: str

class ScoreRequest(BaseModel):
    milestones_done: int
    milestones_total: int
    verified_proofs: int
    total_updates: int
    returning_donors: int
    total_donors: int

@router.post("/verify")
def verify(req: VerifyRequest):
    return verify_image(req.image_url, req.project_description)

@router.post("/impact")
def impact(req: ImpactRequest):
    text = predict_impact(req.amount, req.category, req.ngo_name)
    return {"message": text}

@router.post("/score")
def score(req: ScoreRequest):
    s = compute_score(
        req.milestones_done, req.milestones_total,
        req.verified_proofs, req.total_updates,
        req.returning_donors, req.total_donors
    )
    return {"score": s}