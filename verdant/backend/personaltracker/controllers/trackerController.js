const { getPromptResponse } = require('../../websitetracker/services/ragService');

exports.getResponseFromPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await getPromptResponse(prompt);
    res.status(200).json({ response });
    
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
};