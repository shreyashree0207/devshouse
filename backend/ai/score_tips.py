import anthropic, os
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def get_tips(ngo_name, score, category):
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001", max_tokens=80,
        messages=[{"role":"user","content":
            f"NGO '{ngo_name}' ({category}) transparency score={score}/100. "
            f"Give 3 bullet tips to improve. Max 8 words each. No markdown, no dashes."}]
    )
    return [t.strip() for t in msg.content[0].text.strip().split("\n") if t.strip()][:3]