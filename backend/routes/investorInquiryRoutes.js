const express = require('express');
const router = express.Router();
const investorInquiryController = require('../controllers/investorInquiryController');
const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Public route to submit inquiry
router.post('/inquiry', investorInquiryController.submitInquiry);

// Admin routes (Protected)
router.get('/admin/inquiries', verifyToken, restrictTo(1), investorInquiryController.getAllInquiries);

module.exports = router;
