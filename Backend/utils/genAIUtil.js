const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getFootprintAnalysis = async (userData, category) => {
  if (!userData || !userData.inputs) {
    throw new Error("Invalid user data provided.");
  }

  const userDataString = JSON.stringify(userData.inputs, null, 2);

  let prompt = '';
  const systemMessage = 'You are an expert carbon footprint calculator. Respond ONLY in valid JSON format as per instructions.';

  switch (category) {
    case 'energy':
      prompt = `
Analyze the following energy consumption data and calculate total carbon footprint in kg CO2e.
Use these emission factors:
- Electricity (India): 0.82 kg CO2e/kWh
- LPG: 2.98 kg CO2e/liter
- PNG: 2.03 kg CO2e/scm
- Petrol: 2.31 kg CO2e/liter
- Diesel: 2.68 kg CO2e/liter
- CNG: 2.75 kg CO2e/kg

Provide 3 actionable suggestions based on highest consumption.

User Data:
${userDataString}

Return ONLY this JSON format:
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
Analyze the following food consumption data and calculate total carbon footprint in kg CO2e.
Use these emission factors:
- Beef: 27.0 kg CO2e/kg
- Lamb: 39.0 kg CO2e/kg
- Chicken: 6.0 kg CO2e/kg
- Fish: 5.0 kg CO2e/kg
- Eggs: 4.0 kg CO2e/kg
- Cheese: 8.0 kg CO2e/kg
- Yogurt: 1.2 kg CO2e/kg
- Tofu: 2.0 kg CO2e/kg
- Paneer: 3.0 kg CO2e/kg

Provide 3 actionable suggestions based on highest consumption.

User Data:
${userDataString}

Return ONLY this JSON format:
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
Analyze the following shopping data and calculate total carbon footprint in kg CO2e.
Use these emission factors for electronics and clothing:
Electronics:
- Smartphone: 70 kg CO2e
- Laptop: 200 kg CO2e
- Television: 400 kg CO2e
- Washing Machine: 500 kg CO2e

Clothing per kg material:
- Cotton: 15.0 kg CO2e
- Polyester: 20.0 kg CO2e
- Denim: 30.0 kg CO2e

For items in USD spent:
- New electronics: 3.0 kg CO2e/USD
- New clothes: 4.0 kg CO2e/USD
- Second-hand items: 0.1 kg CO2e/USD

Provide 3 actionable suggestions based on highest consumption.

User Data:
${userDataString}

Return ONLY this JSON format:
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
Analyze the following transport data and calculate total carbon footprint in kg CO2e.
Use these emission factors per km:
- Car (Petrol): 0.15 kg CO2e/km
- Bus (City): 0.08 kg CO2e/km
- Train (Electric): 0.03 kg CO2e/km
- Domestic Flight: 0.18 kg CO2e/km
- Intl Short-haul Flight: 0.16 kg CO2e/km
- Intl Long-haul Flight: 0.14 kg CO2e/km

Provide 3 actionable suggestions based on highest consumption.

User Data:
${userDataString}

Return ONLY this JSON format:
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
        { role: 'user', content: prompt },
      ],
    });

    const jsonString = chatCompletion.choices[0].message.content;

    // Extract JSON safely
    const match = jsonString.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in AI response");
    const aiResponse = JSON.parse(match[0]);

    return {
      carbonFootprintKg: aiResponse.carbonFootprintKg,
      suggestions: aiResponse.suggestions,
    };

  } catch (error) {
    console.error(`Error calling OpenAI API for ${category}:`, error);
    throw new Error('Failed to get analysis from AI model.');
  }
};
