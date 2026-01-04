const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Public route to get all FAQs
router.get('/', faqController.getFAQs);

// Admin routes - Protected
router.post('/', verifyToken, restrictTo(1), faqController.createFAQ);
router.put('/:id', verifyToken, restrictTo(1), faqController.updateFAQ);
router.delete('/:id', verifyToken, restrictTo(1), faqController.deleteFAQ);

module.exports = router;
