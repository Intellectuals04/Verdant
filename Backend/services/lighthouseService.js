const { default: lighthouse } = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

exports.runLighthouseAudit = async (url) => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      "--headless=new",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--incognito",
    ],
  });
  const options = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
  };

  try {
    const result = await lighthouse(url, options);
    return result.lhr.categories.performance.score * 100;
  } catch (error) {
    console.error(`Lighthouse Audit Error for ${url}:`, error);
    throw new Error(`Lighthouse audit failed: ${error.message || error}`);
  } finally {
    await chrome.kill();
  }
};
