def calculate_decay(ngo_data: dict) -> dict:
    days_since_last_update = ngo_data.get("days_since_last_update", 0)
    current_score = ngo_data.get("current_score", 100)
    total_donations_received = ngo_data.get("total_donations_received", 0.0)
    milestones_pending = ngo_data.get("milestones_pending", 0)
    last_decay_applied = ngo_data.get("last_decay_applied", 0)

    points_to_deduct = 0
    decay_reason = ""
    alert_donor = False
    
    # Check if applied within 7 days
    if 0 < last_decay_applied < 7:
        return {
            "points_to_deduct": 0,
            "new_score": current_score,
            "decay_reason": "Decay already applied recently (within 7 days).",
            "alert_donor": False,
            "days_until_next_decay": 7 - last_decay_applied
        }

    if days_since_last_update <= 30:
        points_to_deduct = 0
        decay_reason = "NGO is active. No decay applied."
        days_until_next_decay = 31 - days_since_last_update
    elif 31 <= days_since_last_update <= 45:
        points_to_deduct = 5
        decay_reason = "No updates in 31-45 days."
        days_until_next_decay = 46 - days_since_last_update
    elif 46 <= days_since_last_update <= 60:
        points_to_deduct = 10
        decay_reason = "No updates in 46-60 days."
        days_until_next_decay = 61 - days_since_last_update
    elif 61 <= days_since_last_update <= 90:
        points_to_deduct = 20
        decay_reason = "No updates in 61-90 days."
        days_until_next_decay = 91 - days_since_last_update
    else:  # 90+ days
        points_to_deduct = 30
        decay_reason = "No updates in over 90 days."
        alert_donor = True
        days_until_next_decay = 7

    # Additional penalty for pending milestones if inactive for > 30 days
    if days_since_last_update > 30 and milestones_pending > 0:
        milestone_penalty = milestones_pending * 3
        points_to_deduct += milestone_penalty
        decay_reason += f" Additional penalty of {milestone_penalty} points for {milestones_pending} pending milestones over 30 days old."

    new_score = max(0, current_score - points_to_deduct)

    if new_score < 50:
        alert_donor = True
        
    return {
        "points_to_deduct": points_to_deduct,
        "new_score": new_score,
        "decay_reason": decay_reason.strip(),
        "alert_donor": alert_donor,
        "days_until_next_decay": days_until_next_decay
    }


def generate_donor_alert(ngo_data: dict, decay_result: dict) -> str:
    ngo_name = ngo_data.get("ngo_name", "the NGO")
    days_inactive = ngo_data.get("days_since_last_update", 0)
    current_score = decay_result.get("new_score", 0)
    
    alert_msg = (
        f"🚨 Updates from {ngo_name} 🚨\n"
        f"We noticed that {ngo_name} has not posted any proof updates in {days_inactive} days. "
        f"As a result, their transparency score has dropped to {current_score}/100.\n"
        f"Please be assured that your donated funds are safe and tracked securely. "
        f"However, we encourage you to check the NGO's page and request an update on the milestones."
    )
    return alert_msg


if __name__ == "__main__":
    import json

    scenarios = [
        {
            "name": "NGO updated yesterday (no decay)",
            "data": {
                "ngo_name": "Green Earth",
                "days_since_last_update": 1,
                "current_score": 90,
                "total_donations_received": 1000.0,
                "milestones_pending": 0,
                "last_decay_applied": 0
            }
        },
        {
            "name": "NGO silent for 40 days",
            "data": {
                "ngo_name": "Education First",
                "days_since_last_update": 40,
                "current_score": 85,
                "total_donations_received": 2500.0,
                "milestones_pending": 1,
                "last_decay_applied": 0
            }
        },
        {
            "name": "NGO silent for 75 days with 3 pending milestones",
            "data": {
                "ngo_name": "Water for All",
                "days_since_last_update": 75,
                "current_score": 80,
                "total_donations_received": 5000.0,
                "milestones_pending": 3,
                "last_decay_applied": 0
            }
        },
        {
            "name": "NGO silent for 100 days (should trigger donor alert)",
            "data": {
                "ngo_name": "Shelter Hope",
                "days_since_last_update": 100,
                "current_score": 75,
                "total_donations_received": 15000.0,
                "milestones_pending": 2,
                "last_decay_applied": 0
            }
        }
    ]

    for sc in scenarios:
        print(f"\n--- {sc['name']} ---")
        result = calculate_decay(sc['data'])
        print("Decay Result:", json.dumps(result, indent=2))
        
        # In the prompt: "Print full results for all 4 scenarios including the donor alert message for the last two."
        if sc['name'] in ["NGO silent for 75 days with 3 pending milestones", "NGO silent for 100 days (should trigger donor alert)"]:
            alert = generate_donor_alert(sc['data'], result)
            print("Donor Alert Message:\n" + alert)