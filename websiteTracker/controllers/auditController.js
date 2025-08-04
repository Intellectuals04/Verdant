// websitetracker/controllers/auditController.js
const { runLighthouseAudit } = require('../services/lighthouseService');
const { scrapePageResources } = require('../services/scraperService');
const { checkGreenHosting } = require('../services/hostingService');
const { runEcoIndexAnalysis } = require('../services/ecoindexService');
const { applyHeuristics } = require('../services/heuristicsService');
const { scrapeDetailedPageData, breakdownResources } = require('../services/pageAnalysisService');

// Import the new Mongoose model
const AuditReport = require('../models/AuditReport');
// const { ConsoleMessage } = require('puppeteer'); // This import seems unused and could be removed

exports.auditWebsite = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // 1️⃣ Lighthouse performance audit
    const lighthouseScore = await runLighthouseAudit(url);

    // 2️⃣ Basic page resource scrape
    const resourceData = await scrapePageResources(url);

    // 3️⃣ Emissions analysis via WebsiteCarbon API
    const carbonAnalysis = await runEcoIndexAnalysis(url);

    // 4️⃣ Apply custom heuristics
    const heuristics = await applyHeuristics(resourceData);

    // 5️⃣ Check green hosting status (if still used)
    const greenHosting = await checkGreenHosting(url);

    // 6️⃣ In-depth page & resource analysis
    const detailedData = await scrapeDetailedPageData(url);
    const breakdown = breakdownResources(detailedData.resources);

    // 7️⃣ Final Verdict Logic
    const verdict = (lighthouseScore > 60 && carbonAnalysis.co2PerVisit < 0.8 && greenHosting)
      ? 'Optimized'
      : 'Needs Improvement';

    // 8️⃣ Create the audit report object
    const auditReport = {
      url,
      lighthouseScore,
      carbonAnalysis,
      resourceData,
      heuristics,
      greenHosting,
      verdict,
      breakdown,
      pageAnalysis: detailedData.domData
    };

    // 9️⃣ Save the report to MongoDB
    const newReport = new AuditReport(auditReport);
    await newReport.save();

    // 🔟 Send a success response back to the frontend
    res.status(200).json({
      message: 'Audit complete. Report saved to MongoDB.',
      reportId: newReport._id,
      // --- ADDED/MODIFIED LINE BELOW ---
      detailedReport: auditReport // Send the full auditReport object
    });

  } catch (error) {
    console.error('Audit failed:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message }); // Added error.message for more detail
  }
};