import anthropic, os
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def generate_receipt(donor_name, amount, ngo_name, impact):
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001", max_tokens=100,
        messages=[{"role":"user","content":
            f"3-line donation receipt. Donor={donor_name}, ₹{amount}, NGO={ngo_name}. "
            f"Line1: thank you. Line2: 80G tax exemption note. Line3: impact={impact}. No markdown."}]
    )
    return msg.content[0].text.strip()