const express = require('express');
const router = express.Router();
const cashfreeController = require('../controllers/cashfreeController');
const authMiddleware = require('../middleware/authMiddleware');


// Protected routes (authentication required)
router.post('/orders', authMiddleware, cashfreeController.createOrder);
router.post('/payment-links', authMiddleware, cashfreeController.createPaymentLink);
router.get('/user/payment-links', authMiddleware, cashfreeController.getUserPaymentLinks);
router.post('/orders/:orderId/refunds', authMiddleware, cashfreeController.refundPayment);
router.get('/orders/:orderId/refunds/:refundId', authMiddleware, cashfreeController.getRefund);
router.get('/settlements', authMiddleware, cashfreeController.getSettlements);

// Payment status update routes
router.put('/orders/:orderId/status', authMiddleware, cashfreeController.updatePaymentStatus);
router.put('/transactions/:transactionId/status', authMiddleware, cashfreeController.updatePaymentStatusByTransactionId);
router.put('/bulk-update-status', authMiddleware, cashfreeController.bulkUpdatePaymentStatuses);

// Transaction retrieval routes
router.get('/orders/:orderId/transaction', authMiddleware, cashfreeController.getTransactionByOrderId);
router.get('/transactions/:transactionId', authMiddleware, cashfreeController.getTransactionByTransactionId);
router.get('/transactions', authMiddleware, cashfreeController.getTransactions);

// Public routes (no authentication required)
router.get('/orders/:orderId', cashfreeController.getOrder);
router.get('/payment-links/:linkId', cashfreeController.getPaymentLink);
router.get('/payment-methods', cashfreeController.getPaymentMethods);
router.post('/webhook', cashfreeController.webhookHandler);

module.exports = router;