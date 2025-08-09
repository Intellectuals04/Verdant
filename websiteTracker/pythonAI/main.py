from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import google.generativeai as genai
import json
from markupsafe import Markup
from mongodb import get_latest_audit_report
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

def tojson_filter(value):
    return Markup(json.dumps(value))
templates.env.filters["tojson"] = tojson_filter

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-pro")

def generate_ai_suggestions(report):
    prompt = f"""
    Analyze this website audit report and give 3-5 clear actionable suggestions to improve
    performance, reduce carbon emissions, and make the site more eco-friendly. The suggestions should be short, concise, and easy to understand.

    Report:
    {report}
    """

    response = model.generate_content(prompt)
    suggestions_text = response.text.strip()
    return [line.strip("-• ") for line in suggestions_text.split("\n") if line.strip()]

@app.get("/", response_class=HTMLResponse)
async def analyze(request: Request):
    report = get_latest_audit_report()

    # Define a default report dictionary to prevent errors when no report is found.
    default_report = {
        "url": "No report found",
        "carbonAnalysis": {"co2PerVisit": 0.0, "cleanerThan": "0.00%"},
        "lighthouseScore": 0,
        "breakdown": {"js": 0, "css": 0, "images": 0, "fonts": 0, "videos": 0, "others": 0},
        "greenHosting": False,
    }

    if not report:
        report = default_report
        ai_suggestions = ["No audit report available to generate suggestions from."]
    else:
        # The breakdown data is now correctly passed to the template.
        ai_suggestions = generate_ai_suggestions(report)
        
    return templates.TemplateResponse("report.html", {
        "request": request,
        "report": report,
        "suggestions": ai_suggestions,
    })