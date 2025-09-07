const genAIUtil = require("../utils/genAIUtil");
const Footprint = require("../models/Footprint");

exports.processFootprintData = async (userData, category) => {
  const aiAnalysis = await genAIUtil.getFootprintAnalysis(userData, category);
  const footprintRecord = {
    category: category,
    userInput: userData,
    calculatedFootprintKg: aiAnalysis.carbonFootprintKg,
    aiSuggestions: aiAnalysis.suggestions,
  };

  const newEntry = new Footprint(footprintRecord);
  await newEntry.save();

  return {
    footprint: aiAnalysis.carbonFootprintKg,
    suggestions: aiAnalysis.suggestions,
  };
};
