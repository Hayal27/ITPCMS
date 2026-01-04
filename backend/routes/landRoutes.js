const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Land Zone Routes
router.get('/zones', landController.getLandZones);
router.post('/zones', verifyToken, restrictTo(1), landController.createLandZone);
router.put('/zones/:id', verifyToken, restrictTo(1), landController.updateLandZone);
router.delete('/zones/:id', verifyToken, restrictTo(1), landController.deleteLandZone);

// Leased Land Routes
router.get('/', landController.getLeasedLands);
router.post('/', verifyToken, restrictTo(1), landController.createLeasedLand);
router.put('/:id', verifyToken, restrictTo(1), landController.updateLeasedLand);
router.delete('/:id', verifyToken, restrictTo(1), landController.deleteLeasedLand);

module.exports = router;
