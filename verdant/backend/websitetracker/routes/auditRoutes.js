const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

router.post('/audit', auditController.auditWebsite);

module.exports = router;