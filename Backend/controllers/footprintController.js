const footprintService = require('../services/footprintService');

exports.calculateFootprint = async (req, res) => {
  try {
    const { category } = req.params;
    const userData = req.body;

    if (!userData || Object.keys(userData).length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided.' });
    }

    const result = await footprintService.processFootprintData(userData, category);

    res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error(`Error in footprintController for category ${req.params.category}:`, error);
    res.status(500).json({ success: false, message: 'Server error while calculating footprint.' });
  }
};