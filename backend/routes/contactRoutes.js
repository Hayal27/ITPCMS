const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyToken = require('../middleware/verifyToken');

// Public route to submit contact form
router.post('/contact', contactController.submitContactForm);

// Admin routes (Protected)
router.get('/admin/messages', verifyToken, contactController.getAllMessages);
router.put('/admin/messages/:id/read', verifyToken, contactController.markAsRead);
router.delete('/admin/messages/:id', verifyToken, contactController.deleteMessage);

module.exports = router;
