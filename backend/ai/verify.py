import os
import json
import urllib.request
from pathlib import Path
from dotenv import load_dotenv

from google import genai
from google.genai import types

# Load environment variables from the .env file in the backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

def verify_image(image_url: str, project_description: str) -> dict:
    """
    Calls the Google Gemini API to verify if an image matches the project description.
    Also checks for signs of image manipulation or stock reuse, and outputs an appropriate label.
    """
    if not image_url:
        return {"score": 0, "verdict": "No image provided.", "label": "REJECTED"}

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"score": 0, "verdict": "GEMINI_API_KEY not found.", "label": "REJECTED"}

    client = genai.Client(api_key=api_key)

    prompt = (
        f"Does this image show activity consistent with this project description: '{project_description}'? "
        "Also check for signs of image manipulation or reuse (like stock photos), and factor that into the score. "
        "Give a score out of 100 where 0 is completely unrelated/fake and 100 is perfectly matching/authentic. "
        'Respond in exactly this JSON format: {"score": 85, "verdict": "one sentence here"}. '
        'No extra text.'
    )

    try:
        # Fetch the image to pass as bytes to Gemini
        req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            image_bytes = response.read()
            mime_type = response.headers.get('content-type', 'image/jpeg')

        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image_part, prompt],
        )
        
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        score = int(data.get("score", 0))
        verdict = str(data.get("verdict", ""))
        
        # Determine string label based on numeric score
        if score >= 75:
            label = "VERIFIED"
        elif score >= 40:
            label = "PARTIAL"
        else:
            label = "REJECTED"

        return {"score": score, "verdict": verdict, "label": label}
        
    except Exception as e:
        print(f"ACTUAL ERROR: {e}")
        return {"score": 0, "verdict": "An error occurred during verification.", "label": "REJECTED"}

if __name__ == "__main__":
    print("Test 1: Unrelated image (Dice vs building a school)")
    print(verify_image(
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
        "building a school in rural area"
    ))
    
    print("\nTest 2: Stock photo of a classroom (Might get labeled PARTIAL or REJECTED for stock look)")
    print(verify_image(
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655",
        "authentic poor rural school in a developing area"
    ))

    print("\nTest 3: Realistic scene (Another Unsplash photo, testing 'modern classroom' desc)")
    print(verify_image(
        "https://images.unsplash.com/photo-1509062522246-3755977927d7",
        "students taking notes inside a modern classroom setting"
    ))
