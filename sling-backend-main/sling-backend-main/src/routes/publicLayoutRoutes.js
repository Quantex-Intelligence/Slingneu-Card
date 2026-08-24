const express = require("express");
const router = express.Router();
const layoutController = require("../controllers/layoutController");

// Public routes (no authentication required)

// Get layouts by type (public access)
router.get("/type/:type", layoutController.getLayoutsByType);

module.exports = router; 