const express = require("express");
const router = express.Router();
const footprintController = require("../controllers/footprintController");

router.post("/:category", footprintController.calculateFootprint);

module.exports = router;
