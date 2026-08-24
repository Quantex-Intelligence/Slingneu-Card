const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Operator routes
router.post('/operators', authMiddleware, adminMiddleware, operatorController.createOperator);
router.put('/operators/:operatorId', authMiddleware, adminMiddleware, operatorController.updateOperator);
router.delete('/operators/:operatorId', authMiddleware, adminMiddleware, operatorController.deleteOperator);
router.get('/operators/:operatorId', operatorController.getOperatorById);
router.get('/operators', operatorController.getAllOperators);
router.get('/operators/category/:category', operatorController.getOperatorsByCategory);

// Circle Code routes
router.post('/circle-codes', authMiddleware, adminMiddleware, operatorController.createCircleCode);
router.put('/circle-codes/:circleCodeId', authMiddleware, adminMiddleware, operatorController.updateCircleCode);
router.delete('/circle-codes/:circleCodeId', authMiddleware, adminMiddleware, operatorController.deleteCircleCode);
router.get('/circle-codes/:circleCodeId', operatorController.getCircleCodeById);
router.get('/circle-codes', operatorController.getAllCircleCodes);
router.get('/circle-codes/region/:region', operatorController.getCircleCodesByRegion);

// Seeding routes (admin only)
router.post('/seed/operators', authMiddleware, adminMiddleware, operatorController.seedOperators);
router.post('/seed/circle-codes', authMiddleware, adminMiddleware, operatorController.seedCircleCodes);

module.exports = router; 