const express = require('express');
const router = express.Router();
const liveEventController = require('../controllers/liveEventController');

// Public routes
router.get('/active', liveEventController.getActiveEvent);
router.get('/:id', liveEventController.getEventById);
router.get('/', liveEventController.getEvents);

// Admin routes
router.post('/', liveEventController.createEvent);
router.put('/:id', liveEventController.updateEvent);
router.delete('/:id', liveEventController.deleteEvent);
router.post('/:id/stream', liveEventController.toggleStreaming);
router.post('/:id/record', liveEventController.toggleRecording);
router.post('/:id/signaling', liveEventController.updateSignaling);

module.exports = router;
