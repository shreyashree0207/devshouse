from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.ngos import router as ngos_router
from routes.donations import router as donations_router
from routes.updates import router as updates_router
from routes.gov import router as gov_router
from routes.ai_upload import router as ai_upload_router
from routes.ai_resources import router as ai_resources_router
from routes.ai_rewrite import router as ai_rewrite_router
from routes.attestations import router as att_router
from routes.core import router as core_router
app.include_router(core_router)
app.include_router(att_router, prefix="/attestations")
app = FastAPI(title="Sustainify API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ngos_router)
app.include_router(donations_router)
app.include_router(updates_router)
app.include_router(gov_router)
app.include_router(ai_upload_router)
app.include_router(ai_resources_router)
app.include_router(ai_rewrite_router)

@app.get("/")
def home():
    return {"message": "Sustainify backend running"}