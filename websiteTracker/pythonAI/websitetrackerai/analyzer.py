def analyze_json(json_data):
    print("DEBUG: Raw JSON =>", json_data)

    # ✅ Extract values from nested fields
    emissions = float(json_data.get("carbonAnalysis", {}).get("co2PerVisit", 0)) * 1000  # g CO2
    lighthouse = json_data.get("lighthouseScore", 0)

    # ✅ Calculate total page size in MB
    resources = json_data.get("resourceData", [])
    total_size_bytes = sum([int(r.get("size", 0)) for r in resources])
    page_size_mb = round(total_size_bytes / (1024 * 1024), 2)

    # ✅ Create suggestions
    suggestions = []
    if emissions > 1:
        suggestions.append("Optimize images & scripts to reduce CO₂ emissions.")
    if page_size_mb > 2:
        suggestions.append("Compress and minify resources to lower page size.")
    if lighthouse < 50:
        suggestions.append("Improve performance and accessibility to increase Lighthouse score.")

    summary = f"This website emits {emissions:.2f}g CO₂ per visit."

    return {
        "summary": summary,
        "suggestions": suggestions,
        "chart_data": {
            "labels": ["Emissions (g)", "Page Size (MB)", "Lighthouse Score"],
            "values": [round(emissions, 2), page_size_mb, lighthouse]
        }
    }
