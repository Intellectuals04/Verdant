const axios = require('axios');

exports.runEcoIndexAnalysis = async (url) => {
  try {
    const response = await axios.get(`https://api.websitecarbon.com/site?url=${encodeURIComponent(url)}`);
    const data = response.data;

    return {
      co2PerVisit: data.c02.grid.grams, // CO2 emissions in grams per visit
      cleanerThan: (data.cleanerThan * 100).toFixed(2) + '%',
      greenHost: data.green
    };

  } catch (error) {
    console.error('WebsiteCarbon API Error:', error.message);
    return {
      co2PerVisit: null,
      cleanerThan: 'Unknown',
      greenHost: null
    };
  }
};