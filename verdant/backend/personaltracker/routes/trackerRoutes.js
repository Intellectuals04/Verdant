const express = require('express');
const router = express.Router();
const { getResponseFromPrompt } = require('../controllers/trackerController');

router.post('/prompt', getResponseFromPrompt);

module.exports = router;