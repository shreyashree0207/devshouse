from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

class ResourceRequest(BaseModel):
    ngo_name: str
    category: str
    city: str
    goal: str

@router.post("/resources")
async def generate_resources(data: ResourceRequest):
    # Simulated AI resource selection for hackathon
    cat = data.category.lower()
    
    summary = f"Hello {data.ngo_name}, based on your goal of '{data.goal}' in {data.city}, here are some strategic AI-curated resources to boost your transparency and donor trust."
    
    if "edu" in cat:
        resources = [
            {"title": "Global Literacy Reporting Standards", "type": "Guide", "url": "https://unesco.org", "description": "How to report student progress with high-confidence data."},
            {"title": "Open-Source Educational Assets", "type": "Assets", "url": "https://oercommons.org", "description": "Free high-quality learning materials for your project."},
            {"title": "CSR Funding for Education - 2025 India", "type": "Report", "url": "https://pib.gov.in", "description": "Latest compliance guides for education sector funding."}
        ]
    elif "env" in cat:
        resources = [
            {"title": "Verifying Carbon Sequestration", "type": "Guide", "url": "https://goldstandard.org", "description": "How to prove your tree planting efforts are impactful."},
            {"title": "Geotagging for Environment Impact", "type": "Tech", "url": "http://geodjango.org", "description": "Strategic advice on using mobile tech for environmental mapping."},
            {"title": "ESG Reporting Dashboard - Env Edition", "type": "Assets", "url": "https://greenhousegasprotocol.org", "description": "Standardized templates for environmental transparency."}
        ]
    elif "health" in cat:
         resources = [
            {"title": "Tele-Health Transparency Protocol", "type": "Tech", "url": "https://who.int", "description": "Building trust in community health camps with remote diagnostics."},
            {"title": "Medical Inventory Audit Tools", "type": "Assets", "url": "https://msf.org", "description": "Simplified logging for medicines and vaccine storage."},
            {"title": "Healthcare CSR Compliance 2025", "type": "Report", "url": "https://mohfw.gov.in", "description": "Updated guidelines for medical NGOs in India."}
        ]
    else:
        resources = [
            {"title": "NGO Transparency Framework", "type": "Guide", "url": "https://transparency.org", "description": "Universal best practices for keeping donor trust high."},
            {"title": "AI Narrative Polish for NGOs", "type": "Tech", "url": "https://openai.com", "description": "Polishing your on-field updates for better donor reach."},
            {"title": "Impact-to-Growth Pipeline", "type": "Report", "url": "https://bridgespan.org", "description": "Scaling your social enterprise via data-backed impact proof."}
        ]
        
    return {
        "summary": summary,
        "resources": resources
    }
