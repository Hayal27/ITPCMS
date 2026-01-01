const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

const verifyToken = require('../middleware/verifyToken');

// Public route to get all FAQs
router.get('/', faqController.getFAQs);

// Admin routes (Protected)
router.post('/', verifyToken, faqController.createFAQ);
router.put('/:id', verifyToken, faqController.updateFAQ);
router.delete('/:id', verifyToken, faqController.deleteFAQ);

module.exports = router;
