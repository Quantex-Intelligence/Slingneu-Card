const express = require('express');
const router = express.Router();
const physicalCardController = require('../controllers/physicalCardController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create a new physical card request
router.post('/create', physicalCardController.createPhysicalCardRequest);

// Get user's physical card requests
router.get('/my-requests', physicalCardController.getMyPhysicalCardRequests);

// Get specific physical card request by ID
router.get('/my-requests/:id', physicalCardController.getMyPhysicalCardRequestById);

// Cancel physical card request (only if status is PENDING)
router.put('/my-requests/:id/cancel', physicalCardController.cancelPhysicalCardRequest);

// Get physical card request statistics
router.get('/stats', physicalCardController.getMyPhysicalCardStats);

module.exports = router; 