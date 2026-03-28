from fastapi import APIRouter
from pydantic import BaseModel

ai_router = APIRouter()

class VerifyRequest(BaseModel):
    image_url: str
    project_description: str

class ImpactRequest(BaseModel):
    amount: float
    category: str

@ai_router.post("/verify")
def verify(body: VerifyRequest):
    # FAKE DATA first — real ML implementation comes later
    return {
        "score": 88, 
        "verdict": f"Image appears consistent with '{body.project_description}'"
    }

@ai_router.post("/impact")
def impact(body: ImpactRequest):
    # FAKE DATA first
    return {
        "message": f"Your ₹{body.amount} contribution provides essential resources for {body.category}."
    }
