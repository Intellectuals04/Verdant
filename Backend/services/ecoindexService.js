const axios = require("axios");

exports.runEcoIndexAnalysis = async (url) => {
  let siteBytes = 0;
  let isGreenHosted = 0;

  try {
    const websiteResponse = await axios.head(url);
    siteBytes = parseInt(websiteResponse.headers["content-length"], 10);

    isGreenHosted = await checkIfGreenHost(url);

    if (isNaN(siteBytes) || siteBytes <= 0) {
      console.warn(
        `Could not determine content length for ${url}. Skipping WebsiteCarbon API call.`
      );
      return {
        co2PerVisit: null,
        cleanerThan: "Unknown",
        greenHost: null,
      };
    }

    const carbonApiResponse = await axios.get(
      `https://api.websitecarbon.com/data?bytes=${siteBytes}&green=${isGreenHosted}`
    );
    const data = carbonApiResponse.data;

    // Note: The response structure for /data might be different.
    return {
      co2PerVisit: data.statistics.co2.grid.grams,
      cleanerThan: (data.cleanerThan * 100).toFixed(2) + "%",
      greenHost: data.green,
    };
  } catch (error) {
    console.error(
      `WebsiteCarbon API or site fetch Error for ${url}:`,
      error.message
    );
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    return {
      co2PerVisit: null,
      cleanerThan: "Unknown",
      greenHost: null,
    };
  }
};

async function checkIfGreenHost(url) {
  return 0;
}
