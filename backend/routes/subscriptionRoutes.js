const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Public routes
router.post('/subscribe', subscriptionController.subscribe);
router.post('/unsubscribe', subscriptionController.unsubscribe);

// Admin routes - Protected
router.get('/subscribers', verifyToken, restrictTo(1), subscriptionController.getAllSubscribers);

module.exports = router;
