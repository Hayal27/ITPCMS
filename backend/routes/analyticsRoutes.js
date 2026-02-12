const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// All analytics routes require authentication and Admin role
router.get('/stats', verifyToken, restrictTo(1), analyticsController.getDashboardStats);
router.get('/growth', verifyToken, restrictTo(1), analyticsController.getMonthlyGrowth);

module.exports = router;
