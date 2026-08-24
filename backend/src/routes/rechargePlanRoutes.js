const express = require('express');
const router = express.Router();
const rechargePlanController = require('../controllers/rechargePlanController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes (no authentication required)
router.get('/plans', rechargePlanController.getAllPlans);
router.get('/plans/search', rechargePlanController.searchPlans);
router.get('/plans/popular', rechargePlanController.getPopularPlans);
router.get('/plans/best-sellers', rechargePlanController.getBestSellerPlans);
router.get('/plans/special-offers', rechargePlanController.getSpecialOffers);
router.get('/plans/statistics', rechargePlanController.getPlanStatistics);
router.get('/plans/:planId', rechargePlanController.getPlanById);
router.get('/plans/plan-id/:planId', rechargePlanController.getPlanByPlanId);
router.get('/plans/:operatorCode/:circleCode', rechargePlanController.getPlansByOperatorAndCircle);

// Admin routes (require authentication and admin privileges)
router.post('/plans', authMiddleware, adminMiddleware, rechargePlanController.createPlan);
router.put('/plans/:planId', authMiddleware, adminMiddleware, rechargePlanController.updatePlan);
router.delete('/plans/:planId', authMiddleware, adminMiddleware, rechargePlanController.deletePlan);
router.post('/plans/bulk', authMiddleware, adminMiddleware, rechargePlanController.bulkCreatePlans);

module.exports = router; 