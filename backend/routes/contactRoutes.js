const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Public route to submit contact form
router.post('/contact', contactController.submitContactForm);

// Admin routes (Protected)
router.get('/admin/messages', verifyToken, restrictTo(1), contactController.getAllMessages);
router.put('/admin/messages/:id/read', verifyToken, restrictTo(1), contactController.markAsRead);
router.delete('/admin/messages/:id', verifyToken, restrictTo(1), contactController.deleteMessage);

module.exports = router;
