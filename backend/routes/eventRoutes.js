const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Public
router.get('/events', eventController.getAllEvents);
router.get('/eventsf', eventController.getAllEvents);
router.get('/events/:id', eventController.getEventById);

// Protected
router.post('/events', verifyToken, restrictTo(1), upload.any(), eventController.createEvent);
router.put('/editEvent/:id', verifyToken, restrictTo(1), upload.any(), eventController.updateEvent);
router.delete('/deleteEvent/:id', verifyToken, restrictTo(1), eventController.deleteEvent);

module.exports = router;
