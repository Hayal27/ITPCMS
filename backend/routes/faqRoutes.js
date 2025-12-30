const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// Public route to get all FAQs
router.get('/', faqController.getFAQs);

// Admin routes (should be protected in a real app)
router.post('/', faqController.createFAQ);
router.put('/:id', faqController.updateFAQ);
router.delete('/:id', faqController.deleteFAQ);

module.exports = router;
