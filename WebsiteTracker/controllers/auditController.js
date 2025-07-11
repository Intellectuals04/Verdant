const { runLighthouseAudit } = require('../services/lighthouseService');
const { scrapePageResources } = require('../services/scraperService');
const { checkGreenHosting } = require('../services/hostingService');
const { runEcoIndexAnalysis } = require('../services/ecoindexService');
const { applyHeuristics } = require('../services/heuristicsService');
const { scrapeDetailedPageData, breakdownResources } = require('../services/pageAnalysisService');

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

    // 8️⃣ Return consolidated result
    res.status(200).json({
      url,
      lighthouseScore,
      carbonAnalysis,
      resourceData,
      heuristics,
      greenHosting,
      verdict,
      pageDetails: detailedData.domData,
      assetBreakdown: breakdown
    });

  } catch (err) {
    console.error('Audit Error:', err);
    res.status(500).json({ error: err.message });
  }
};