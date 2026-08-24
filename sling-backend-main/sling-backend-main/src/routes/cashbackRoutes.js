const express = require("express");
const router = express.Router();
const cashbackController = require("../controllers/cashbackController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const cashbackUploadMiddleware = require("../middleware/cashbackUploadMiddleware");

// Public routes (no authentication required)
router.get("/active", cashbackController.getActiveCashbacks);
router.get("/public/:id", cashbackController.getCashbackByIdPublic);

// Admin routes (require authentication and admin role)
router.use(authMiddleware);

// CRUD operations for cashbacks
router.post("/", cashbackUploadMiddleware, cashbackController.createCashback);
router.get("/", cashbackController.getAllCashbacks);
router.get("/:id", cashbackController.getCashbackById);
router.put("/:id", cashbackUploadMiddleware, cashbackController.updateCashbackById);
router.delete("/:id", cashbackController.deleteCashbackById);

module.exports = router; 