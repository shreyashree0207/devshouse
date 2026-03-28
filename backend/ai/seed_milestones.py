import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from the .env file in the backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

from google import genai

def generate_milestones(ngo: dict) -> list:
    """
    Calls the Gemini API to generate exactly 4 realistic milestones for an NGO.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.stderr.write("Error: GEMINI_API_KEY not found in environment.\n")
        return []

    client = genai.Client(api_key=api_key)

    total_amount = ngo.get("total_goal_amount", 100000.0)
    category = ngo.get("category", "")
    name = ngo.get("name", "")
    desc = ngo.get("description", "")

    prompt = f"""
Generate exactly 4 realistic milestones for an NGO named '{name}' working in the '{category}' category.
Description of their work: '{desc}'
The total goal amount they are raising is {total_amount}.

Rules:
1. Milestones should be realistic and actionable for their specific category (e.g., if education: buy books, build classroom; if food: procure supplies, set up kitchen).
2. The 'amount_locked' across all 4 milestones MUST exactly add up to {total_amount}.
3. The 'required_proof' must be specific (e.g., "Photo of books distributed to children", not just "photo").
4. All milestones must start with status "LOCKED".
5. Return exactly a JSON list of 4 objects matching this format, with no markdown formatting, and no extra text outside the JSON:

[
  {{
    "title": "milestone name",
    "description": "what needs to be done",
    "amount_locked": 25000,
    "required_proof": "what image proof is needed",
    "status": "LOCKED"
  }}
]
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        # Strip potential markdown formatting
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return data
    except Exception as e:
        sys.stderr.write(f"Error generating milestones for {name}: {e}\n")
        return []

def seed_database():
    ngos = [
        {
            "name": "Shiksha Foundation",
            "category": "education",
            "city": "Chennai",
            "description": "Providing quality basic education and learning materials for underprivileged children in urban slums.",
            "total_goal_amount": 100000.0
        },
        {
            "name": "Pragati Path",
            "category": "education",
            "city": "Mumbai",
            "description": "Setting up digital classrooms and providing tablets for students in under-resourced schools.",
            "total_goal_amount": 200000.0
        },
        {
            "name": "Annamayya Trust",
            "category": "food/hunger",
            "city": "Delhi",
            "description": "Running community kitchens to provide hot, nutritious meals to homeless individuals.",
            "total_goal_amount": 80000.0
        },
        {
            "name": "Nourish The Nation",
            "category": "food/hunger",
            "city": "Bangalore",
            "description": "Distributing monthly ration kits containing rice, dal, and oil to migrant laborers.",
            "total_goal_amount": 150000.0
        },
        {
            "name": "Aarogya Health Mission",
            "category": "healthcare",
            "city": "Chennai",
            "description": "Organizing mobile medical camps offering free health checkups and essential medicines to street dwellers.",
            "total_goal_amount": 300000.0
        },
        {
            "name": "Vriksh Protectors",
            "category": "environment",
            "city": "Delhi",
            "description": "Planting native trees across barren urban lands and maintaining them to increase green cover.",
            "total_goal_amount": 50000.0
        }
    ]

    results = []
    
    for ngo in ngos:
        # Using stderr for progress logs so that stdout only contains the final JSON output
        sys.stderr.write(f"Generating milestones for: {ngo['name']}...\n")
        milestones = generate_milestones(ngo)
        ngo_data = dict(ngo)
        ngo_data["milestones"] = milestones
        results.append(ngo_data)
        
    # Print the final result to stdout as formatted JSON
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    seed_database()
