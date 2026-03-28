"""
Multi-layer AI image verification for NGO proof submissions.
Uses Google Gemini to perform:
  Layer 1 — Authenticity (AI-generated / stock / real photo)
  Layer 2 — Relevance (does image match claimed activity)
  Layer 3 — Geo consistency (image landmarks vs NGO location)
  Layer 4 — Before/After comparison (visible progress)
"""

import os
import json
import urllib.request
import base64
import io
import hashlib
from pathlib import Path
from typing import Optional
from PIL import Image
import imagehash
from database import supabase

try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(env_path)
except ImportError:
    pass

from google import genai
from google.genai import types


def _get_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment")
    return genai.Client(api_key=api_key)


def _fetch_image_bytes(image_url: str) -> tuple[bytes, str]:
    """Download image and return (bytes, mime_type)."""
    req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        return response.read(), response.headers.get('content-type', 'image/jpeg')


def calculate_image_hash(image_data: bytes) -> str:
    """Calculate a perceptual hash for duplicate detection."""
    try:
        img = Image.open(io.BytesIO(image_data)).convert("RGB")
        return str(imagehash.phash(img))
    except Exception:
        return hashlib.sha256(image_data).hexdigest()


def check_for_duplicates(image_hash: str) -> dict:
    """Query Supabase for existing image hashes."""
    try:
        dupes = supabase.table("proof_fingerprints").select("ngo_id, created_at").eq("image_hash", image_hash).execute()
        if dupes.data and len(dupes.data) > 0:
            return {
                "is_duplicate": True,
                "original_ngo": dupes.data[0].get("ngo_id"),
                "first_seen": dupes.data[0].get("created_at")
            }
        return {"is_duplicate": False}
    except Exception:
        return {"is_duplicate": False}


def verify_single_image(
    image_data: bytes,
    mime_type: str,
    project_description: str,
    ngo_city: str = "",
    ngo_state: str = "Tamil Nadu",
    submitted_lat: float = 0,
    submitted_lng: float = 0,
    ngo_lat: float = 0,
    ngo_lng: float = 0,
) -> dict:
    """
    Multi-layer verification of a single proof image.
    Returns comprehensive verification result.
    """
    # 0. DUPLICATE DETECTION (FINGERPRINTING)
    img_hash = calculate_image_hash(image_data)
    dup_result = check_for_duplicates(img_hash)

    client = _get_client()

    # Only include location info in prompt if non-zero
    location_details = f"""
**NGO registered location**: {ngo_city}, {ngo_state}
"""
    if submitted_lat != 0 or submitted_lng != 0:
        location_details += f"**Photo GPS coordinates**: {submitted_lat}, {submitted_lng}\n"
    if ngo_lat != 0 or ngo_lng != 0:
        location_details += f"**NGO registered coordinates**: {ngo_lat}, {ngo_lng}\n"

    prompt = f"""You are a fraud detection AI for Sustainify, an NGO transparency platform.

This image was uploaded by an NGO as proof of their project.

**Project description**: "{project_description}"
{location_details}

Perform ALL 3 verification layers and respond ONLY with this exact JSON:

{{
  "short_description": "a small, concise, and catchy 1-sentence description of the image content only",
  "layer1_authenticity": {{
    "is_real": true or false,
    "confidence": 0-100,
    "type": "real_photo" or "ai_generated" or "stock_image",
    "reason": "one sentence explanation",
    "signals_detected": ["list of specific signals found"]
  }},
  "layer2_relevance": {{
    "matches_description": true or false,
    "confidence": 0-100,
    "reason": "does image actually show the claimed activity?",
    "detected_objects": ["what is visible in the image"]
  }},
  "layer3_geo_consistency": {{
    "location_plausible": true or false,
    "confidence": 0-100,
    "reason": "do visual landmarks/environment match the claimed region?",
    "detected_region_cues": ["any regional indicators visible"]
  }},
  "overall_trust_score": 0-100,
  "verdict": "VERIFIED" or "FLAGGED" or "REJECTED",
  "verdict_reason": "2 sentence honest assessment based on verification layers",
  "tags": ["descriptive tags of what's in the image"],
  "spoofing_flags": ["list any red flags, empty array if none"],
  "authentic": true if overall_trust_score >= 70,
  "requires_manual_review": true if score between 50-70
}}

**Important Instructions**: 
- **STRICT RULE**: DO NOT include any technical data, literal coordinate numbers (like 0.0, 0, or 0.0.0.0), or confidence scores in the `short_description`, `verdict_reason`, or ANY layer `reason` field. 
- The `short_description` should only describe what is visually happening in the image in a punchy way.
- The `verdict_reason` and layer `reason` fields should provide analysis based on visual evidence, not by reciting metadata numbers.
- If coordinates are zero/missing, simply state that location metadata is unavailable and focus on visual environment matching.

**Layer 1 — Authenticity Check**:
- AI generation signs: perfect lighting, no imperfections, dreamlike quality, weird hands/text, unnatural symmetry
- Stock photo signs: watermarks, overly professional composition, generic poses, studio lighting
- Real photo signs: candid framing, slight blur, natural lighting, imperfections, real people

**Layer 2 — Relevance Check**:
- Does image content match what the NGO claims?
- If NGO says "tree planting" but image shows a beach = FLAGGED
- Look for people, equipment, infrastructure matching the activity

**Layer 3 — Geo Consistency Check**:
- Do visible landmarks, vegetation, architecture match {ngo_city}, {ngo_state}?
- GPS distance check: are submitted coordinates plausible for this region?
- Flag if environment looks completely different from claimed location

**Red Flags to Watch For**:
- Indoor photo for claimed outdoor activity
- No human presence for a people-focused activity
- Image too polished for field work
- Signs of digital manipulation or editing
- Screenshot or photo of a screen"""

    image_part = types.Part.from_bytes(data=image_data, mime_type=mime_type)

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image_part, prompt],
        )

        text = response.text.replace('```json', '').replace('```', '').strip()
        result = json.loads(text)
        
        # Add duplicate detection info to result
        result["image_hash"] = img_hash
        result["duplicate_check"] = dup_result
        
        if dup_result.get("is_duplicate"):
            result["overall_trust_score"] = min(result["overall_trust_score"], 20)
            result["verdict"] = "REJECTED"
            result["spoofing_flags"].append("DUPLICATE_IMAGE_DETECTED")
            result["authentic"] = False
            result["verdict_reason"] = f"CRITICAL: This image is a duplicate of an existing proof from NGO {dup_result.get('original_ngo')}. AI analysis halted."

        return result

    except Exception as e:
        print(f"Image verification error: {e}")
        return {
            "layer1_authenticity": {
                "is_real": False, "confidence": 0,
                "type": "unknown", "reason": f"Verification failed: {str(e)}",
                "signals_detected": []
            },
            "layer2_relevance": {
                "matches_description": False, "confidence": 0,
                "reason": "Could not verify", "detected_objects": []
            },
            "layer3_geo_consistency": {
                "location_plausible": False, "confidence": 0,
                "reason": "Could not verify", "detected_region_cues": []
            },
            "overall_trust_score": 0,
            "verdict": "REJECTED",
            "verdict_reason": f"Verification failed: {str(e)}",
            "tags": [], "spoofing_flags": ["verification_error"],
            "authentic": False, "requires_manual_review": True
        }


def verify_before_after(
    before_data: bytes,
    before_mime: str,
    after_data: bytes,
    after_mime: str,
    project_description: str,
    ngo_city: str = "",
) -> dict:
    """
    Compare before and after images to verify visible progress.
    """
    client = _get_client()

    prompt = f"""You are a fraud detection AI for Sustainify, an NGO transparency platform.

You are given TWO images:
- Image 1 = BEFORE (shows the problem/initial state)
- Image 2 = AFTER (shows the work done by the NGO)

**NGO's project**: "{project_description}"
**Location**: {ngo_city}

Compare both images and respond ONLY with this exact JSON:

{{
  "same_location": true or false,
  "same_location_confidence": 0-100,
  "visible_progress": true or false,
  "progress_confidence": 0-100,
  "before_description": "what the before image shows",
  "after_description": "what the after image shows",
  "change_summary": "what changed between the two images",
  "consistency_with_project": true or false,
  "overall_before_after_score": 0-100,
  "verdict": "VERIFIED" or "FLAGGED" or "REJECTED",
  "verdict_reason": "2 sentence assessment of the before/after comparison",
  "spoofing_flags": ["any red flags like images being from different locations"]
}}

**Watch for**:
- Are both images plausibly from the same location?
- Is there genuine visible change/progress?
- Could the "before" image just be a random photo?
- Do BOTH images match the project description?
- Are the images just the same photo with filters/edits?"""

    before_part = types.Part.from_bytes(data=before_data, mime_type=before_mime)
    after_part = types.Part.from_bytes(data=after_data, mime_type=after_mime)

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[before_part, after_part, prompt],
        )

        text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)

    except Exception as e:
        print(f"Before/after verification error: {e}")
        return {
            "same_location": False, "same_location_confidence": 0,
            "visible_progress": False, "progress_confidence": 0,
            "before_description": "Error", "after_description": "Error",
            "change_summary": f"Verification failed: {str(e)}",
            "consistency_with_project": False,
            "overall_before_after_score": 0,
            "verdict": "REJECTED",
            "verdict_reason": f"Before/after comparison failed: {str(e)}",
            "spoofing_flags": ["verification_error"]
        }


def check_suspicious_patterns(
    ngo_id: str,
    recent_uploads: list,
    ngo_city: str,
) -> dict:
    """
    Check for suspicious upload patterns:
    - Burst uploads (5+ in 10 minutes)
    - All images with identical metadata
    - GPS never matches NGO city
    """
    flags = []
    severity = "low"

    # Check burst uploads
    if len(recent_uploads) >= 5:
        from datetime import datetime, timedelta
        timestamps = sorted([u.get("created_at", "") for u in recent_uploads])
        if len(timestamps) >= 5:
            try:
                first = datetime.fromisoformat(timestamps[0].replace('Z', '+00:00'))
                last = datetime.fromisoformat(timestamps[4].replace('Z', '+00:00'))
                if (last - first).total_seconds() < 600:  # 10 minutes
                    flags.append("burst_upload")
                    severity = "high"
            except (ValueError, TypeError):
                pass

    # Check GPS consistency
    gps_mismatches = sum(
        1 for u in recent_uploads
        if u.get("geotag_match_score", 100) < 30
    )
    if gps_mismatches > 2:
        flags.append("repeated_gps_mismatch")
        severity = "critical" if gps_mismatches > 4 else "high"

    # Check for identical metadata (clone detection)
    devices = set(u.get("device_info", "") for u in recent_uploads if u.get("device_info"))
    timestamps_set = set(u.get("capture_timestamp", "") for u in recent_uploads if u.get("capture_timestamp"))
    if len(recent_uploads) > 3 and len(timestamps_set) <= 1 and len(devices) <= 1:
        flags.append("metadata_clone")
        severity = "high"

    # Check for consistently low AI scores
    scores = [u.get("overall_trust_score", 0) for u in recent_uploads if u.get("overall_trust_score")]
    if scores and sum(scores) / len(scores) < 40:
        flags.append("consistently_low_ai_score")
        severity = "critical"

    return {
        "ngo_id": ngo_id,
        "flags": flags,
        "severity": severity,
        "flagged": len(flags) > 0,
        "flag_count": len(flags),
        "description": f"Detected {len(flags)} suspicious pattern(s): {', '.join(flags)}" if flags else "No suspicious patterns"
    }


# --- Quick test ---
if __name__ == "__main__":
    print("=== Multi-Layer Image Verification Module ===")
    print("Testing with a sample image URL...")

    url = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400"
    img_bytes, mime = _fetch_image_bytes(url)

    result = verify_single_image(
        image_data=img_bytes,
        mime_type=mime,
        project_description="Community volunteer cleanup drive in Chennai",
        ngo_city="Chennai",
        ngo_state="Tamil Nadu"
    )
    print(json.dumps(result, indent=2))
