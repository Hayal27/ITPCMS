const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middleware/verifyToken');

// All analytics routes require authentication
router.get('/stats', verifyToken, analyticsController.getDashboardStats);
router.get('/growth', verifyToken, analyticsController.getMonthlyGrowth);

module.exports = router;
