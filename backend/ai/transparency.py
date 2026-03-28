# backend/ai/transparency.py
def compute_score(milestones_done: int, milestones_total: int,
                  verified_proofs: int, total_updates: int,
                  returning_donors: int, total_donors: int) -> int:
    m = (milestones_done / max(milestones_total, 1)) * 40
    p = (verified_proofs / max(total_updates, 1)) * 40
    d = (returning_donors / max(total_donors, 1)) * 20
    return round(m + p + d)

def combined_trust_score(ai_score: int, attestation_count: int, total_upvotes: int) -> dict:
    community = min(50, (attestation_count * 5) + (total_upvotes * 1))
    ai_weighted = int(ai_score * 0.5)
    total = min(100, ai_weighted + community)
    return {
        "total": total,
        "ai_contribution": ai_weighted,
        "community_contribution": community,
        "breakdown": f"AI: {ai_weighted}/50 + Community: {community}/50"
    }