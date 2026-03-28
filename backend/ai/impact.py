# backend/ai/impact.py
import anthropic, os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def predict_impact(amount: int, category: str, ngo_name: str) -> str:
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=60,
        messages=[{"role": "user", "content":
            f"NGO '{ngo_name}' focused on {category} receives ₹{amount}. "
            f"Write ONE sentence (max 15 words) on what this achieves. "
            f"Be specific: use real units like meals, children, books, days. No filler words."
        }]
    )
    return msg.content[0].text.strip()