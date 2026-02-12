const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const verifyToken = require('../middleware/verifyToken');
const { upload, validateUploadedFile } = require('../middleware/uploadMiddleware');
const { sanitizeInput, validateRequired } = require('../middleware/inputValidation');
const { hasMenuPermission } = require('../middleware/menuPermissionMiddleware');

// Public
router.get('/events', eventController.getAllEvents);
router.get('/eventsf', eventController.getAllEvents);
router.get('/events/:id', eventController.getEventById);

// Protected
router.post(
    '/events',
    verifyToken,
    hasMenuPermission('/post/managePosts'),
    upload.any(),
    validateUploadedFile,
    sanitizeInput(['description'], ['registrationLink', 'youtubeUrl']),
    validateRequired(['title', 'date', 'description', 'time', 'venue']),
    eventController.createEvent
);

router.put(
    '/editEvent/:id',
    verifyToken,
    hasMenuPermission('/post/managePosts'),
    upload.any(),
    validateUploadedFile,
    sanitizeInput(['description'], ['registrationLink', 'youtubeUrl']),
    eventController.updateEvent
);

router.delete(
    '/deleteEvent/:id',
    verifyToken,
    hasMenuPermission('/post/managePosts'),
    eventController.deleteEvent
);

module.exports = router;
