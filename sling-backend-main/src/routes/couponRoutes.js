const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const couponUploadMiddleware = require("../middleware/couponUploadMiddleware");

// Public routes (no authentication required)
router.get("/active", couponController.getActiveCoupons);
router.get("/code/:code", couponController.getCouponByCode);
router.get("/search", couponController.searchCoupons);
router.get("/", couponController.getAllCoupons);

// Admin routes (require authentication and admin role)
router.use(authMiddleware);

// CRUD operations for coupons
router.post("/", couponUploadMiddleware, couponController.createCoupon);
router.get("/:id", couponController.getCouponById);
router.put("/:id", couponUploadMiddleware, couponController.updateCouponById);
router.delete("/:id", couponController.deleteCouponById);

module.exports = router; 