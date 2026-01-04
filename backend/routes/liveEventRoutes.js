const express = require('express');
const router = express.Router();
const liveEventController = require('../controllers/liveEventController');

const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Public routes
router.get('/active', liveEventController.getActiveEvent);
router.get('/:id', liveEventController.getEventById);
router.get('/', liveEventController.getEvents);

// Admin routes - Protected
router.post('/', verifyToken, restrictTo(1), liveEventController.createEvent);
router.put('/:id', verifyToken, restrictTo(1), liveEventController.updateEvent);
router.delete('/:id', verifyToken, restrictTo(1), liveEventController.deleteEvent);
router.post('/:id/stream', verifyToken, restrictTo(1), liveEventController.toggleStreaming);
router.post('/:id/record', verifyToken, restrictTo(1), liveEventController.toggleRecording);
router.post('/:id/signaling', verifyToken, restrictTo(1), liveEventController.updateSignaling);

module.exports = router;
