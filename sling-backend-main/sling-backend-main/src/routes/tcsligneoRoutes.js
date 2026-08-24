const express = require('express');
const router = express.Router();
const tcsligneoController = require('../controllers/tcsligneoController');

// KYC Routes
router.post('/generate-otp', tcsligneoController.generateOTP);
router.post('/register', tcsligneoController.registerCustomer);
router.post('/validate-pan', tcsligneoController.validatePAN);

// Wallet Routes
router.post('/load-wallet', tcsligneoController.loadWallet);
router.get('/balance/:entityId', tcsligneoController.fetchBalance);
router.post('/set-pin', tcsligneoController.setPin);

// Card Management Routes
router.post('/card/lock-unlock', tcsligneoController.cardLockUnlock);
router.post('/card/replace', tcsligneoController.replaceCard);
router.post('/card/physical', tcsligneoController.requestPhysicalCard);
router.post('/card/list', tcsligneoController.getCardList);
router.post('/card/widget', tcsligneoController.getCardWidget);

// Transaction Routes
router.get('/transactions/:entityId', tcsligneoController.fetchTransactions);

// Preference Routes
router.post('/preferences/set-limit', tcsligneoController.setTransactionLimit);
router.post('/preferences/fetch', tcsligneoController.fetchPreferences);

// M2P Webhook Routes
router.post('/webhook/m2p', tcsligneoController.handleM2PWebhook);
router.get('/webhook/health', tcsligneoController.webhookHealthCheck);

module.exports = router; 