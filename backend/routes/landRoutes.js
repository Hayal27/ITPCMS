const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

const verifyToken = require('../middleware/verifyToken');

// Land Zone Routes
router.get('/zones', landController.getLandZones);
router.post('/zones', verifyToken, landController.createLandZone);
router.put('/zones/:id', verifyToken, landController.updateLandZone);
router.delete('/zones/:id', verifyToken, landController.deleteLandZone);

// Leased Land Routes
router.get('/', landController.getLeasedLands);
router.post('/', verifyToken, landController.createLeasedLand);
router.put('/:id', verifyToken, landController.updateLeasedLand);
router.delete('/:id', verifyToken, landController.deleteLeasedLand);

module.exports = router;
