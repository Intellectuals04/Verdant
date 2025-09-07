const express = require("express");
const { runLighthouseAudit } = require("../services/lighthouseService");
const { scrapePageResources } = require("../services/scraperService");
const { checkGreenHosting } = require("../services/hostingService");
const { runEcoIndexAnalysis } = require("../services/ecoindexService");
const { applyHeuristics } = require("../services/heuristicsService");
const {
  scrapeDetailedPageData,
  breakdownResources,
} = require("../services/pageAnalysisService");
const app = express();
// Import the new Mongoose model
const AuditReport = require("../models/AuditReport");
const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

app.get("/notfound", (req, res, next) => {
  next(new AppError("Resource not found", 404));
});

exports.getAuditReport = (req, res) => {
  try {
    logger.info("Audit report requested");
    res.json({ msg: "Audit report generated" });
  } catch (err) {
    logger.error("Error generating report: " + err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.auditWebsite = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // Lighthouse performance audit
    const lighthouseScore = await runLighthouseAudit(url);

    // Basic page resource scrape
    const resourceData = await scrapePageResources(url);

    // Emissions analysis via WebsiteCarbon API
    const carbonAnalysis = await runEcoIndexAnalysis(url);

    // Apply custom heuristics
    const heuristics = await applyHeuristics(resourceData);

    // Check green hosting status (if still used)
    const greenHosting = await checkGreenHosting(url);

    // In-depth page & resource analysis
    const detailedData = await scrapeDetailedPageData(url);
    const breakdown = breakdownResources(detailedData.resources); // This produces the breakdown object

    // Final Verdict Logic
    const verdict =
      lighthouseScore > 60 && carbonAnalysis.co2PerVisit < 0.8 && greenHosting
        ? "Optimized"
        : "Needs Improvement";

    // Create the audit report object
    const auditReport = {
      url,
      lighthouseScore,
      carbonAnalysis,
      resourceData,
      heuristics,
      greenHosting,
      verdict,
      breakdown: breakdown,
      pageAnalysis: detailedData.domData,
    };

    // Save the report to MongoDB
    const newReport = new AuditReport(auditReport);
    await newReport.save();

    // Send a success response back to the frontend
    res.status(200).json({
      message: "Audit complete. Report saved to MongoDB.",
      reportId: newReport._id,
      detailedReport: auditReport, // Send the full auditReport object with new fields
    });
  } catch (error) {
    console.error("Audit failed:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
