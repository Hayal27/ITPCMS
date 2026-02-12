const express = require('express');
const router = express.Router();
const officeController = require('../controllers/officeController');

const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Building routes
const { hasMenuPermission } = require('../middleware/menuPermissionMiddleware');

router.get('/buildings', officeController.getBuildings);
router.post('/buildings', verifyToken, hasMenuPermission('/content/offices'), officeController.createBuilding);
router.put('/buildings/:id', verifyToken, hasMenuPermission('/content/offices'), officeController.updateBuilding);
router.delete('/buildings/:id', verifyToken, hasMenuPermission('/content/offices'), officeController.deleteBuilding);

// Office routes
router.get('/', officeController.getOffices);
router.post('/', verifyToken, hasMenuPermission('/content/offices'), officeController.createOffice);
router.put('/:id', verifyToken, hasMenuPermission('/content/offices'), officeController.updateOffice);
router.delete('/:id', verifyToken, hasMenuPermission('/content/offices'), officeController.deleteOffice);

module.exports = router;
