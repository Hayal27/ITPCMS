const express = require('express');
const router = express.Router();
const investorInquiryController = require('../controllers/investorInquiryController');
const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');
const { submissionLimiter } = require('../middleware/rateLimiter');
const verifyCaptcha = require('../middleware/captchaMiddleware');

// Public route to submit inquiry with security
router.post('/submit', submissionLimiter, verifyCaptcha, investorInquiryController.submitInquiry);

// Admin routes (Protected by matrix)
const { hasMenuPermission } = require('../middleware/menuPermissionMiddleware');

router.get('/admin/inquiries', verifyToken, hasMenuPermission('/interaction/investor-inquiries'), investorInquiryController.getAllInquiries);

module.exports = router;
