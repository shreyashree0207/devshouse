"""
Impact Feed routes — Live donor activity stream.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from database import supabase

feed_router = APIRouter()


class FeedItemRequest(BaseModel):
    type: str = "donation"
    user_name: str = "Anonymous"
    ngo_name: str = ""
    amount: Optional[float] = None
    message: str = ""
    activity_title: str = ""
    category: str = ""
    icon: str = "🌱"


@feed_router.get("/feed")
async def get_impact_feed(limit: int = 20):
    """
    Get recent impact feed events.
    Returns a social-media-like activity stream.
    """
    try:
        feed = supabase.table("impact_feed").select("*").execute().data or []
        # Sort by created_at descending, take limit
        feed.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return feed[:limit]
    except Exception as e:
        # Return seeded demo data if table doesn't exist
        return _get_demo_feed()


@feed_router.post("/feed")
async def add_feed_item(body: FeedItemRequest):
    """
    Add an event to the impact feed.
    """
    try:
        result = supabase.table("impact_feed").insert({
            "type": body.type,
            "user_name": body.user_name,
            "ngo_name": body.ngo_name,
            "amount": body.amount,
            "message": body.message,
            "activity_title": body.activity_title,
            "category": body.category,
            "icon": body.icon,
        }).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        return {"success": False, "error": str(e)}


def _get_demo_feed():
    """Seed data for demo — realistic Indian donor activity."""
    return [
        {
            "id": "demo-1",
            "type": "donation",
            "user_name": "Priya Sharma",
            "ngo_name": "GreenSteps Chennai",
            "amount": 500,
            "message": "Will fund 2 tree planting sessions in Adyar",
            "activity_title": "Urban Green Cover Drive",
            "category": "Environment",
            "icon": "🌱",
            "created_at": "2026-03-29T00:48:00+05:30"
        },
        {
            "id": "demo-2",
            "type": "donation",
            "user_name": "Rahul Krishnan",
            "ngo_name": "Udaan Education Trust",
            "amount": 1000,
            "message": "Will provide textbooks for 12 children in Salem",
            "activity_title": "Books for Bright Futures",
            "category": "Education",
            "icon": "📚",
            "created_at": "2026-03-29T00:35:00+05:30"
        },
        {
            "id": "demo-3",
            "type": "verification",
            "user_name": "System",
            "ngo_name": "Namma Medics",
            "amount": None,
            "message": "Proof verified: Medical camp photo scored 94/100 — AI confirmed authentic",
            "activity_title": "Free Eye Checkup Camp",
            "category": "Healthcare",
            "icon": "✅",
            "created_at": "2026-03-29T00:20:00+05:30"
        },
        {
            "id": "demo-4",
            "type": "milestone",
            "user_name": "System",
            "ngo_name": "Clean Coast TN",
            "amount": None,
            "message": "Milestone 2 completed: 500kg plastic removed from Marina Beach",
            "activity_title": "Marina Beach Cleanup",
            "category": "Environment",
            "icon": "🏆",
            "created_at": "2026-03-29T00:10:00+05:30"
        },
        {
            "id": "demo-5",
            "type": "donation",
            "user_name": "Ananya Reddy",
            "ngo_name": "Akshara Foundation",
            "amount": 2500,
            "message": "Will support 3 months of after-school tutoring for 5 students",
            "activity_title": "After-School Academic Support",
            "category": "Education",
            "icon": "✨",
            "created_at": "2026-03-28T23:55:00+05:30"
        },
        {
            "id": "demo-6",
            "type": "badge",
            "user_name": "System",
            "ngo_name": "GreenSteps Chennai",
            "amount": None,
            "message": "Earned 'Consistent Verifier' badge — 10 consecutive proofs verified above 85/100",
            "activity_title": "",
            "category": "Environment",
            "icon": "🛡️",
            "created_at": "2026-03-28T23:40:00+05:30"
        },
        {
            "id": "demo-7",
            "type": "donation",
            "user_name": "Karthik Sundaram",
            "ngo_name": "Namma Medics",
            "amount": 750,
            "message": "Will cover medicines for 15 patients at the next health camp",
            "activity_title": "Community Health Initiative",
            "category": "Healthcare",
            "icon": "💊",
            "created_at": "2026-03-28T23:25:00+05:30"
        },
        {
            "id": "demo-8",
            "type": "donation",
            "user_name": "Meera Venkat",
            "ngo_name": "Clean Coast TN",
            "amount": 300,
            "message": "Will provide cleanup kits for 6 volunteers",
            "activity_title": "Marina Beach Cleanup",
            "category": "Environment",
            "icon": "🌊",
            "created_at": "2026-03-28T23:10:00+05:30"
        },
    ]
