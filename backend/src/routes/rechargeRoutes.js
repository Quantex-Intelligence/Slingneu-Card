const express = require('express');
const router = express.Router();
const rechargeController = require('../controllers/rechargeController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/operators', rechargeController.getOperators);
router.get('/circle-codes', rechargeController.getCircleCodes);
router.get('/balance', rechargeController.getBalance);
router.get('/status/:orderid', rechargeController.getRechargeStatus);
router.get('/transaction/order/:orderid', rechargeController.getTransactionByOrderId);
router.get('/transaction/:transactionId', rechargeController.getTransactionByTransactionId);
router.get('/callback', rechargeController.handleCallback);

// Protected routes (authentication required)
router.post('/create', authMiddleware, rechargeController.createRecharge);
router.get('/transactions', authMiddleware, rechargeController.getUserTransactions);

// Admin routes (admin authentication required)
router.get('/admin/transactions', authMiddleware, rechargeController.getAllTransactions);
router.get('/admin/statistics', authMiddleware, rechargeController.getStatistics);

module.exports = router; 