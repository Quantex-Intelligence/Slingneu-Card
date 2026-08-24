const express = require("express");
const router = express.Router();
const scratchCardController = require("../controllers/scratchCardController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public routes (require authentication but not admin)
router.use(authMiddleware);

// Create scratch card (check cashback conditions)
router.post("/", scratchCardController.createScratchCard);

// Get scratch cards by user ID
router.get("/user/:userId", scratchCardController.getScratchCardsByUser);

// Get scratch card by ID
router.get("/:id", scratchCardController.getScratchCardById);

// Update scratch card (mark as used)
router.put("/:id", scratchCardController.updateScratchCard);

// Admin routes (require admin role)

// Get all scratch cards (Admin only)
router.get("/", scratchCardController.getAllScratchCards);

// Get scratch card statistics (Admin only)
router.get("/stats/overview", scratchCardController.getScratchCardStats);

module.exports = router; 