def calculate_transparency_score(ngo_data: dict) -> dict:
    total_proofs = ngo_data.get('total_proofs', 0)
    verified_proofs = ngo_data.get('verified_proofs', 0)
    total_milestones = ngo_data.get('total_milestones', 0)
    completed_milestones = ngo_data.get('completed_milestones', 0)
    days_since_last_update = ngo_data.get('days_since_last_update', None)
    donor_count = ngo_data.get('donor_count', 0)
    repeat_donor_count = ngo_data.get('repeat_donor_count', 0)
    flagged_count = ngo_data.get('flagged_count', 0)

    # Proof verification rate (30 points)
    proof_score = 0
    if total_proofs > 0:
        proof_score = int((verified_proofs / total_proofs) * 30)
        
    # Milestone completion rate (25 points)
    milestone_score = 0
    if total_milestones > 0:
        milestone_score = int((completed_milestones / total_milestones) * 25)
        
    # Recency of updates (20 points)
    recency_score = 0
    if days_since_last_update is not None:
        if days_since_last_update <= 30:
            recency_score = 20
        elif days_since_last_update <= 60:
            recency_score = 10
        else:
            recency_score = 0

    # Donor retention rate (15 points)
    retention_score = 0
    if donor_count > 0:
        retention_score = int((repeat_donor_count / donor_count) * 15)

    # Penalty for flags (max 30 points penalty)
    flag_penalty = min(flagged_count * 5, 30)

    # Calculate final score
    raw_score = proof_score + milestone_score + recency_score + retention_score - flag_penalty
    final_score = max(0, min(100, raw_score))

    # Label
    if final_score >= 85:
        label = "EXCELLENT"
    elif final_score >= 70:
        label = "GOOD"
    elif final_score >= 50:
        label = "FAIR"
    else:
        label = "POOR"

    breakdown = {
        "proof_verification": proof_score,
        "milestone_completion": milestone_score,
        "recency_updates": recency_score,
        "donor_retention": retention_score,
        "flag_penalty": -flag_penalty
    }

    improvement_tips = []
    if total_proofs == 0:
        improvement_tips.append("Upload your first proof image to gain up to 30 points.")
    elif proof_score < 30:
        improvement_tips.append("Improve proof quality to ensure more proofs are VERIFIED by AI to recover up to 30 points.")

    if total_milestones == 0:
        improvement_tips.append("Create milestones for your project to earn up to 25 points.")
    elif milestone_score < 25:
        improvement_tips.append("Mark completed milestones to recover up to 25 points.")

    if days_since_last_update is None or days_since_last_update > 30:
        improvement_tips.append("Post a proof update within the next 7 days to recover 20 points.")

    if donor_count == 0:
        pass
    elif retention_score < 15:
        improvement_tips.append("Engage with past donors to encourage repeat donations and improve your retention score.")

    if flag_penalty > 0:
        improvement_tips.append(f"Resolve user flags to remove the {flag_penalty} point penalty.")

    # Limit to max 3 tips
    improvement_tips = improvement_tips[:3]

    return {
        "score": final_score,
        "label": label,
        "breakdown": breakdown,
        "improvement_tips": improvement_tips
    }


if __name__ == "__main__":
    import json
    
    # 1. High performing NGO
    high_ngo = {
        "total_proofs": 50,
        "verified_proofs": 48,
        "total_milestones": 10,
        "completed_milestones": 8,
        "days_since_last_update": 12,
        "donor_count": 200,
        "repeat_donor_count": 50,
        "flagged_count": 0
    }

    # 2. Recently inactive NGO
    inactive_ngo = {
        "total_proofs": 100,
        "verified_proofs": 80,
        "total_milestones": 5,
        "completed_milestones": 2,
        "days_since_last_update": 45,
        "donor_count": 150,
        "repeat_donor_count": 20,
        "flagged_count": 1
    }

    # 3. Newly registered NGO
    new_ngo = {
        "total_proofs": 0,
        "verified_proofs": 0,
        "total_milestones": 0,
        "completed_milestones": 0,
        "days_since_last_update": None,
        "donor_count": 0,
        "repeat_donor_count": 0,
        "flagged_count": 0
    }

    print("--- High Performing NGO ---")
    print(json.dumps(calculate_transparency_score(high_ngo), indent=2))
    print("\n--- Recently Inactive NGO ---")
    print(json.dumps(calculate_transparency_score(inactive_ngo), indent=2))
    print("\n--- Newly Registered NGO ---")
    print(json.dumps(calculate_transparency_score(new_ngo), indent=2))
