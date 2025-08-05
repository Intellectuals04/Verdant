from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os

app = FastAPI()

# Set your Gemini API key here
genai.configure(api_key="YOUR_GEMINI_API_KEY")  # ⬅️ Replace this with your actual API key

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Suggestion function using Gemini
def generate_ai_suggestions(prompt: str) -> str:
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI Error: {str(e)}"

# Example analyze route
@app.post("/analyze")
async def analyze(request: Request):
    body = await request.json()
    
    co2 = body.get("co2")
    total_size = body.get("total_size")
    lighthouse = body.get("lighthouse")
    
    if None in (co2, total_size, lighthouse):
        return {"error": "Missing one or more required fields."}

    try:
        data = {
            "values": [
                float(round(co2, 4)),
                float(round(total_size, 2)),
                int(lighthouse)
            ]
        }
    except TypeError as e:
        return {"error": f"Invalid data: {str(e)}"}

    # AI prompt
    prompt = (
        f"Analyze the following SEO data:\n"
        f"CO2 emission: {data['values'][0]} g, "
        f"Total page size: {data['values'][1]} KB, "
        f"Lighthouse score: {data['values'][2]}.\n"
        f"Provide 3 key suggestions to improve the website’s performance and SEO."
    )

    # Get AI suggestions
    ai_suggestions = generate_ai_suggestions(prompt)

    return {
        "data": data,
        "ai_suggestions": ai_suggestions
    }
