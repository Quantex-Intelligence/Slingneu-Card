const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Signup route
router.post('/signup', uploadMiddleware, authController.signup);

// Login route
router.post('/login', authController.login);

// OTP routes
router.post('/send-otp', authController.sendOtpPhone);
router.post('/verify-otp', authController.verifyOtpPhone);

// Check user exists route
router.post('/check-user', authController.checkUserExists);

// Update profile route (protected)
router.put('/update-profile', authMiddleware, authController.updateProfile);

// Profile image routes (protected)
router.post('/upload-profile-image', authMiddleware, uploadMiddleware, authController.uploadProfileImage);
router.put('/update-profile-image', authMiddleware, uploadMiddleware, authController.updateProfileImage);
router.delete('/delete-profile-image', authMiddleware, authController.deleteProfileImage);

// FCM token route (protected)
router.put('/update-fcm-token', authMiddleware, authController.updateMyFcmToken);

// Referral routes
router.get('/referral-info', authMiddleware, authController.getReferralInfo);
router.post('/apply-referral', authMiddleware, authController.applyReferralCode);
router.post('/validate-referral', authController.validateReferralCode);

module.exports = router; 