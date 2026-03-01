const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/summary", protect, analyticsController.getSummary);
router.get("/export", protect, analyticsController.exportData);

module.exports = router;