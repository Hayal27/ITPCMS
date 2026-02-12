const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Land Zone Routes
const { hasMenuPermission } = require('../middleware/menuPermissionMiddleware');

router.get('/zones', landController.getLandZones);
router.post('/zones', verifyToken, hasMenuPermission('/content/leased-lands'), landController.createLandZone);
router.put('/zones/:id', verifyToken, hasMenuPermission('/content/leased-lands'), landController.updateLandZone);
router.delete('/zones/:id', verifyToken, hasMenuPermission('/content/leased-lands'), landController.deleteLandZone);

// Leased Land Routes
router.get('/', landController.getLeasedLands);
router.post('/', verifyToken, hasMenuPermission('/content/leased-lands'), landController.createLeasedLand);
router.put('/:id', verifyToken, hasMenuPermission('/content/leased-lands'), landController.updateLeasedLand);
router.delete('/:id', verifyToken, hasMenuPermission('/content/leased-lands'), landController.deleteLeasedLand);

module.exports = router;
