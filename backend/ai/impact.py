# TODO: Install the required pip packages before running this code:
# pip install google-genai

# Ensure you have installed python-dotenv: pip install python-dotenv
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from the .env file in the backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
print(f"DEBUG: Looking for .env file at {env_path}")
load_dotenv(env_path)

from google import genai

def get_impact_message(amount: float, category: str) -> str:
    """
    Calls the Google Gemini API to generate a one-sentence impact message
    based on the donation amount and category.
    """
    # TODO: Ensure that the 'GEMINI_API_KEY' environment variable is correctly set in your environment.
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Fallback message if API key isn't provided
        return "Thank you for your generous donation!"

    client = genai.Client(api_key=api_key)

    prompt = (
        f"A donation of {amount} has been made to the '{category}' category. "
        "Respond with EXACTLY ONE single sentence describing the real-world impact of this donation. "
        "Do not include any extra text, greetings, introductory phrases, or quotation marks. "
        "For example, if amount is 500 and category is 'education', respond with "
        "something like 'Your ₹500 will provide textbooks for 3 children in a rural school for one month.'"
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"ACTUAL ERROR: {e}")
        return "Thank you for your generous donation!"
print(get_impact_message(500, "education"))