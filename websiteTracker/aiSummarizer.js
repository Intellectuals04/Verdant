const fs = require('fs');
const path = require('path');
const AuditReport = require('./models/AuditReport');
const axios = require('axios');

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; // stored in .env

async function summarizeWithHuggingFace(prompt) {
  try {
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );
    return response.data[0].summary_text;
  } catch (error) {
    console.error("❌ HuggingFace summarization failed:", error.response?.data || error.message);
    throw new Error("Summarization failed");
  }
}

async function summarizeAuditReport(reportId) {
  const report = await AuditReport.findById(reportId);
  if (!report) throw new Error("Report not found");

  const prompt = `
Audit Summary for ${report.url}:
- Lighthouse Score: ${report.lighthouseScore}
- Carbon Emission per Visit: ${report.carbonAnalysis?.co2PerVisit}
- Green Hosting: ${report.greenHosting}
- Total Requests: ${report.heuristics?.totalRequests}
- Verdict: ${report.verdict}
- Resource Breakdown: ${JSON.stringify(report.breakdown || {})}
- Page Analysis: ${JSON.stringify(report.pageAnalysis || {})}

Generate a concise, user-friendly summary.
  `;

  const summary = await summarizeWithHuggingFace(prompt);

  const htmlContent = `
  <html>
    <head><title>Audit Summary</title></head>
    <body>
      <h1>Audit Summary for ${report.url}</h1>
      <div>${summary.replace(/\n/g, "<br>")}</div>
    </body>
  </html>`;

  const outputPath = path.join(__dirname, 'public', 'report.html');
  fs.writeFileSync(outputPath, htmlContent, 'utf8');
  console.log("✅ Summary written to report.html");
}

module.exports = { summarizeAuditReport };
