const puppeteer = require("puppeteer");

exports.scrapePageResources = async (url) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--incognito",
    ],
  });
  const page = await browser.newPage();

  let resources = [];

  page.on("response", async (response) => {
    try {
      const request = response.request();
      const resUrl = request.url();
      const type = request.resourceType();
      const size = parseInt(response.headers()["content-length"]) || 0;

      resources.push({ url: resUrl, type, size });
    } catch (e) {
      console.warn("Error processing response in scraperService:", e.message);
    }
  });

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
  } catch (error) {
    console.error(`Error navigating to ${url} in scraperService:`, error);
    throw new Error(`Failed to load page in scraper: ${error.message}`);
  } finally {
    await browser.close();
  }

  return resources;
};
