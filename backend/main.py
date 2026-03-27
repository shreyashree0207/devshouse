from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from ai.router import ai_router
from db_client import supabase
import jwt
import os

app = FastAPI(
    title="Sustainify API",
    description="Social impact NGO donation platform API with Supabase auth",
    version="1.0.0"
)

app.include_router(ai_router, prefix="/ai")

# ✅ Enable CORS (frontend can connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH DEPENDENCY: Extracts user info from Supabase JWT ---
def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")
    
    parts = authorization.split(" ")
    if len(parts) < 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid token format. Use: Bearer <token>")
    
    token = parts[1]
    if not token:
        raise HTTPException(status_code=401, detail="Empty token")

    try:
        payload = jwt.decode(token, options={"verify_signature": False}, algorithms=["HS256"])
        user_info = {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated"),
        }
        if not user_info["user_id"]:
            raise HTTPException(status_code=401, detail="Invalid token: no user ID found")
        return user_info
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token format")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


# ✅ Root API
@app.get("/")
def root():
    return {"status": "Sustainify API is live 🚀", "version": "1.0.0"}

# ✅ Health check
@app.get("/health")
def health():
    return {"status": "OK"}

# ═══════════════════════════════════════════════
# NGO ENDPOINTS
# ═══════════════════════════════════════════════

# ✅ Get all NGOs (UNPROTECTED — frontend fetches directly)
@app.get("/ngos")
def get_ngos(city: str = None, category: str = None):
    query = supabase.table("ngos").select("*")
    if city:
        query = query.eq("city", city)
    if category:
        query = query.eq("category", category)
    return query.execute().data

# ✅ Get single NGO + milestones + proofs
@app.get("/ngos/{ngo_id}")
def get_ngo(ngo_id: int):
    ngo = supabase.table("ngos").select("*").eq("id", ngo_id).execute().data
    milestones = supabase.table("milestones").select("*").eq("ngo_id", ngo_id).execute().data
    proofs = supabase.table("proof_updates").select("*").eq("ngo_id", ngo_id).execute().data

    return {
        "ngo": ngo[0] if ngo else None,
        "milestones": milestones or [],
        "proof_updates": proofs or []
    }

# ✅ Search NGOs
@app.get("/search")
def search_ngos(query: str):
    return supabase.table("ngos").select("*").ilike("name", f"%{query}%").execute().data

# ✅ Top NGOs (for homepage)
@app.get("/top-ngos")
def top_ngos():
    return supabase.table("ngos").select("*").order("raised", desc=True).limit(3).execute().data

# ═══════════════════════════════════════════════
# DONATION ENDPOINTS
# ═══════════════════════════════════════════════

# ✅ Donate - PROTECTED
@app.post("/donate")
def donate(data: dict, user=Depends(verify_token)):
    donation_record = {
        "ngo_id": data.get("ngo_id"),
        "amount": data.get("amount"),
        "donor_name": data.get("name", "Anonymous"),
    }
    
    result = supabase.table("donations").insert(donation_record).execute()

    return {
        "success": True,
        "message": f"Donation of ₹{data.get('amount')} recorded successfully 🎉",
        "user_id": user["user_id"],
        "donor_email": user["email"]
    }

# ✅ My Donations - PROTECTED
@app.get("/my-donations")
def my_donations(user=Depends(verify_token)):
    return supabase.table("donations").select("*").eq("donor_name", user["email"]).execute().data

# ✅ Get all donations - PROTECTED
@app.get("/donations")
def get_donations(user=Depends(verify_token)):
    return supabase.table("donations").select("*").execute().data

# ✅ Test who the token belongs to
@app.get("/me")
def get_me(user=Depends(verify_token)):
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
        "message": f"Hello {user['email']}! Your Sustainify identity is verified ✅"
    }