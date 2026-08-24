const express = require("express");
const router = express.Router();
const layoutController = require("../controllers/layoutController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const layoutUploadMiddleware = require("../middleware/layoutUploadMiddleware");

// Public GET routes (no authentication required)
router.get("/", layoutController.getAllLayouts);
router.get("/:id", layoutController.getLayoutById);

// Admin routes (protected by auth and admin middleware)
router.use(authMiddleware);

// Create layout with multiple images
router.post("/", layoutUploadMiddleware, layoutController.createLayout);

// Update layout (can add new images)
router.put("/:id", layoutUploadMiddleware, layoutController.updateLayoutById);

// Delete layout
router.delete("/:id", layoutController.deleteLayoutById);

// Delete specific image from layout
router.delete("/:id/images/:imageIndex", layoutController.deleteImageFromLayout);

module.exports = router; 