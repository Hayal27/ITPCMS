const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyToken = require('../middleware/verifyToken');
const { sanitizeInput, validateRequired, validateTypes } = require('../middleware/inputValidation');
const { hasMenuPermission } = require('../middleware/menuPermissionMiddleware');
const { submissionLimiter } = require('../middleware/rateLimiter');
const verifyCaptcha = require('../middleware/captchaMiddleware');

// Public route to submit contact form with rate limiting and CAPTCHA
router.post(
    '/contact',
    submissionLimiter,
    verifyCaptcha,
    sanitizeInput(['message']),
    validateRequired(['name', 'email', 'subject', 'message']),
    validateTypes({ email: 'email' }),
    contactController.submitContactForm
);

// Admin routes (Protected by matrix)
router.get(
    '/admin/messages',
    verifyToken,
    hasMenuPermission('/interaction/contact-messages'),
    contactController.getAllMessages
);

router.put(
    '/admin/messages/:id/read',
    verifyToken,
    hasMenuPermission('/interaction/contact-messages'),
    contactController.markAsRead
);

router.post(
    '/admin/messages/:id/reply',
    verifyToken,
    hasMenuPermission('/interaction/contact-messages'),
    sanitizeInput(['replyMessage']),
    validateRequired(['replyMessage']),
    contactController.replyToMessage
);

router.delete(
    '/admin/messages/:id',
    verifyToken,
    hasMenuPermission('/interaction/contact-messages'),
    contactController.deleteMessage
);

module.exports = router;
