import os
import google.generativeai as genai
from prompts import get_prompt
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def review_code_logic(code: str, language: str) -> str:
    if not os.getenv("GEMINI_API_KEY"):
        raise RuntimeError("GEMINI_API_KEY is missing. Add it to .env or export it before starting the backend.")

    prompt = get_prompt(code, language)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    feedback = response.text
    return feedback
