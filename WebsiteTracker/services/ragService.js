const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key is missing in the .env file.");
}

// Function to send audit data to Gemini and get suggestions
async function getOptimizationSuggestions(auditData) {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `You are a web performance optimization expert.
Given the following website audit data in JSON format, analyze it and generate clear, actionable, natural language suggestions for improving the website's environmental and performance metrics.

Important:
- Suggest image compression, lazy loading if uncompressedImages > 0.
- Flag external scripts or domains if totalRequests > 50.
- Mention if green hosting is false.
- Advise reducing font and video sizes if they are above 500KB.
- Suggest Lighthouse improvements if score < 80.

Audit JSON:
${JSON.stringify(auditData)}

Respond directly in plain text.`
              }
            ]
          }
        ]
      },
      {
        params: {
          key: GEMINI_API_KEY
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Return Gemini's natural language text response
    const suggestions = response.data.candidates[0].content.parts[0].text;
    return suggestions;

  } catch (error) {
    console.error('Error fetching suggestions from Gemini:', error.response?.data || error.message);
    return 'Failed to generate optimization suggestions. Please check your API key and request structure.';
  }
}

module.exports = { getOptimizationSuggestions };
