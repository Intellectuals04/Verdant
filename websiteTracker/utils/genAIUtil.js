const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getFootprintAnalysis = async (userData, category) => {
  const userDataString = JSON.stringify(userData.inputs, null, 2);
  let prompt = '';
  let systemMessage = 'You are an expert carbon footprint calculator that responds only in valid JSON format.';

  switch (category) {
    case 'energy':
      prompt = `
        You are an expert carbon footprint calculator. Analyze the following energy consumption data to calculate the total carbon footprint and provide actionable suggestions.

        **User Data (in JSON format):**
        ${userDataString}

        **Your Task:**
        1.  **Calculate:** Calculate the total carbon footprint in kilograms of CO2 equivalent (kg CO2e). Iterate through each item. Use these emission factors: Electricity (India): 0.71 kg CO2e/kWh, LPG: 2.9 kg CO2e/kg, Petrol: 2.3 kg CO2e/liter, PNG: 2.04 kg CO2e/scm. Sum all calculated values to get a final total.
        2.  **Suggest:** Based on the user's highest consumption, provide 3 personalized and actionable suggestions to reduce their footprint.
        3.  **Format Output:** Return your response ONLY as a valid JSON object. Do not include any other text or markdown formatting.

        **JSON Structure:**
        {
          "carbonFootprintKg": <number>,
          "suggestions": [
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" }
          ]
        }
      `;
      break;

    case 'food':
      prompt = `
        You are an expert carbon footprint calculator. Analyze the following food consumption data to calculate the total carbon footprint and provide actionable suggestions.

        **User Data (in JSON format):**
        ${userDataString}

        **Your Task:**
        1.  **Calculate:** Calculate the total carbon footprint in kilograms of CO2 equivalent (kg CO2e). Use these sample emission factors: Beef: 27 kg CO2e/kg, Lamb: 39.2 kg CO2e/kg, Chicken: 6.9 kg CO2e/kg, Fish (farmed): 5.1 kg CO2e/kg, Dairy: 3.4 kg CO2e/kg, Tofu: 2.0 kg CO2e/kg.
        2.  **Suggest:** Based on the user's highest consumption, provide 3 personalized and actionable suggestions to reduce their footprint.
        3.  **Format Output:** Return your response ONLY as a valid JSON object.

        **JSON Structure:**
        {
          "carbonFootprintKg": <number>,
          "suggestions": [
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" }
          ]
        }
      `;
      break;

    case 'shopping':
      prompt = `
        You are an expert carbon footprint calculator. Analyze the following shopping data to calculate the total carbon footprint and provide actionable suggestions.

        **User Data (in JSON format):**
        ${userDataString}

        **Your Task:**
        1.  **Calculate:** Estimate the total carbon footprint in kilograms of CO2 equivalent (kg CO2e). Use these sample factors per USD spent: New electronics: 1.5 kg CO2e/USD, New clothes (fast fashion): 2.0 kg CO2e/USD, Second-hand items: 0.2 kg CO2e/USD.
        2.  **Suggest:** Based on the user's highest consumption, provide 3 personalized and actionable suggestions to reduce their footprint.
        3.  **Format Output:** Return your response ONLY as a valid JSON object.

        **JSON Structure:**
        {
          "carbonFootprintKg": <number>,
          "suggestions": [
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" }
          ]
        }
      `;
      break;

    case 'transport':
      prompt = `
        You are an expert carbon footprint calculator. Analyze the following transport data to calculate the total carbon footprint and provide actionable suggestions.

        **User Data (in JSON format):**
        ${userDataString}

        **Your Task:**
        1.  **Calculate:** Calculate the total carbon footprint in kilograms of CO2 equivalent (kg CO2e). Use these sample factors per kilometer: Car (petrol): 0.21 kg CO2e/km, Bus: 0.1 kg CO2e/km, Train: 0.04 kg CO2e/km, Short-haul flight: 0.25 kg CO2e/km, Long-haul flight: 0.18 kg CO2e/km.
        2.  **Suggest:** Based on the user's highest consumption, provide 3 personalized and actionable suggestions to reduce their footprint.
        3.  **Format Output:** Return your response ONLY as a valid JSON object.

        **JSON Structure:**
        {
          "carbonFootprintKg": <number>,
          "suggestions": [
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" }
          ]
        }
      `;
      break;

    default:
      throw new Error(`Invalid category: ${category}`);
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const jsonString = chatCompletion.choices[0].message.content;
    const aiResponse = JSON.parse(jsonString);

    return {
      carbonFootprintKg: aiResponse.carbonFootprintKg,
      suggestions: aiResponse.suggestions,
    };

  } catch (error) {
    console.error(`Error calling OpenAI API for ${category}:`, error);
    throw new Error('Failed to get analysis from Gen AI model.');
  }
};