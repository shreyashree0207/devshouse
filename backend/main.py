from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Optimized Platform Routers (Modular & High-Performance)
from routes.ngos import router as ngos_router
from routes.donations import router as donations_router
from routes.updates import router as updates_router
from routes.gov import router as gov_router
from routes.attestations import router as att_router
from routes.ai_integration import router as ai_verify_router # Final Integrated AI Layer
from routes.feed import feed_router # Live Social Impact Stream

app = FastAPI(
    title="Sustainify API",
    description="Scalable social impact NGO donation platform with multi-layer AI verification and donor transparency.",
    version="2.2.0"
)

# ✅ Efficient Global Connectivity (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTE AGGREGATION ──
# We use /api/v1/ prefix for cross-platform stability

# 1. Platform Intelligence & Verification
app.include_router(ai_verify_router)

# 2. Social Impact Monitoring
app.include_router(feed_router, prefix="/api/v1", tags=["Impact Feed"])

# 3. NGO & Donation Infrastructure
app.include_router(att_router, prefix="/api/v1/attestations")
app.include_router(ngos_router, prefix="/api/v1")
app.include_router(donations_router, prefix="/api/v1")
app.include_router(updates_router, prefix="/api/v1")
app.include_router(gov_router, prefix="/api/v1")

# ── BASE ENDPOINTS ──

@app.get("/")
def root():
    return {
        "status": "Sustainify API v2.2.0 is live 🚀", 
        "architecture": "modular",
        "documentation": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "OK", "services": ["auth", "database", "ai_verification", "impact_feed"]}
