const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// Public routes
router.post('/subscribe', subscriptionController.subscribe);
router.post('/unsubscribe', subscriptionController.unsubscribe);

// Admin routes (TODO: Add authentication middleware later)
router.get('/subscribers', subscriptionController.getAllSubscribers);

module.exports = router;
