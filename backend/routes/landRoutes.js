const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

// Land Zone Routes
router.get('/zones', landController.getLandZones);
router.post('/zones', landController.createLandZone);
router.put('/zones/:id', landController.updateLandZone);
router.delete('/zones/:id', landController.deleteLandZone);

// Leased Land Routes
router.get('/', landController.getLeasedLands);
router.post('/', landController.createLeasedLand);
router.put('/:id', landController.updateLeasedLand);
router.delete('/:id', landController.deleteLeasedLand);

module.exports = router;
