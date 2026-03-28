import jwt
import os
from fastapi import Header, HTTPException, Depends

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
        # Note: In production, verify the signature with your Supabase JWT secret
        payload = jwt.decode(token, options={"verify_signature": False}, algorithms=["HS256"])
        
        # Check user_metadata for custom roles added via Supabase
        user_metadata = payload.get("user_metadata", {})
        custom_role = user_metadata.get("role")
        
        user_info = {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "role": custom_role or payload.get("role", "authenticated"),
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
