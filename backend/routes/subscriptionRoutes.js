const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');
const { submissionLimiter } = require('../middleware/rateLimiter');
const verifyCaptcha = require('../middleware/captchaMiddleware');

// Public routes
router.post('/subscribe', submissionLimiter, verifyCaptcha, subscriptionController.subscribe);
router.post('/unsubscribe', submissionLimiter, subscriptionController.unsubscribe);

// Admin routes - Protected
router.get('/subscribers', verifyToken, restrictTo(1), subscriptionController.getAllSubscribers);

module.exports = router;
