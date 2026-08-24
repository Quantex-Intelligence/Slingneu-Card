const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Admin OTP and login routes (no middleware required)
router.post("/send-otp", adminController.sendOtpForAdmin);
router.post("/login", adminController.adminLogin);

// All other admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// User management routes
router.get("/users", adminController.getAllUsers);
router.get("/users/search", adminController.searchUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUserById);
router.delete("/users/:id", adminController.deleteUserById);

// Notification routes
router.post("/notifications/send-to-all", adminController.sendNotificationToAllUsers);
router.post("/notifications/send-to-users", adminController.sendNotificationToUsers);
router.put("/users/:id/fcm-token", adminController.updateUserFcmToken);
router.get("/notifications/stats", adminController.getNotificationStats);

// Dashboard routes
router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/dashboard/lists", adminController.getDashboardLists);

//tr
router.get("/transactions", adminController.getAllTransactions);

// Physical card request routes
router.get("/physical-card-requests", adminController.getAllPhysicalCardRequests);
router.get("/physical-card-requests/:id", adminController.getPhysicalCardRequestById);
router.put("/physical-card-requests/:id", adminController.updatePhysicalCardRequest);
router.delete("/physical-card-requests/:id", adminController.deletePhysicalCardRequest);

module.exports = router;
