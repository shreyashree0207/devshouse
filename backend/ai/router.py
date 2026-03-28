from fastapi import APIRouter
from pydantic import BaseModel
from .impact import get_impact_message
from .verify import verify_image

router = APIRouter()

class ImpactRequest(BaseModel):
    amount: float
    category: str

class VerifyRequest(BaseModel):
    image_url: str
    project_description: str

@router.post("/impact")
def impact_endpoint(req: ImpactRequest):
    message = get_impact_message(req.amount, req.category)
    return {"message": message}

@router.post("/verify")
def verify_endpoint(req: VerifyRequest):
    result = verify_image(req.image_url, req.project_description)
    return result
