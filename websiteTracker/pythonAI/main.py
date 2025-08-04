from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import google.generativeai as genai
import json
from markupsafe import Markup
from mongodb import get_latest_audit_report  # ⬅️ your custom MongoDB utility

# ✅ Initialize FastAPI
app = FastAPI()

# ✅ Initialize Jinja2 templates
templates = Jinja2Templates(directory="templates")

# ✅ Add `tojson` filter to Jinja
def tojson_filter(value):
    return Markup(json.dumps(value))
templates.env.filters["tojson"] = tojson_filter

# ✅ Set OpenAI key securely
# openai.api_key = "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"  # You can use dotenv for security
genai.configure(api_key="AIzaSyCMHG78XXBZsquGMl4VAcj0Q2BNf7JCOw0")  # Secure this properly

model = genai.GenerativeModel("gemini-2.5-pro")

# ✅ Function to generate AI suggestions
def generate_ai_suggestions(report):
    prompt = f"""
    Analyze this website audit report and give 3-5 clear actionable suggestions to improve
    performance, reduce carbon emissions, and make the site more eco-friendly.

    Report:
    {report}
    """

    response = model.generate_content(prompt)


    suggestions_text = response.text.strip()
    return [line.strip("-• ") for line in suggestions_text.split("\n") if line.strip()]

# ✅ Route to render the latest report
@app.get("/", response_class=HTMLResponse)
async def analyze(request: Request):
    report = get_latest_audit_report()

    if not report:
        return templates.TemplateResponse("report.html", {
            "request": request,
            "summary": "No report found",
            "chart_data": {},
            "suggestions": []
        })

    # ✅ Extract metrics
    co2 = report["carbonAnalysis"]["co2PerVisit"]
    lighthouse = report.get("lighthouseScore", 0)
    total_size = sum([r["size"] for r in report.get("resourceData", [])]) / (1024 * 1024)  # Convert bytes to MB

    chart_data = {
        "labels": ["CO₂ per Visit (g)", "Total Page Size (MB)", "Lighthouse Score"],
        "values": [
                       float(round(co2, 4)) if co2 is not None else 0.0,
                       float(round(total_size, 2)) if total_size is not None else 0.0,
                       int(lighthouse) if lighthouse is not None else 0
                  ]
    }

    ai_suggestions = generate_ai_suggestions(report)

    return templates.TemplateResponse("report.html", {
        "request": request,
        "summary": f"This website emits {chart_data['values'][0]}g CO₂ per visit. Lighthouse Score: {chart_data['values'][2]}.",
        "chart_data": chart_data,
        "suggestions": ai_suggestions
    })
