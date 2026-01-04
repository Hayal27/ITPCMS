const express = require('express');
const router = express.Router();
const officeController = require('../controllers/officeController');

const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Building routes
router.get('/buildings', officeController.getBuildings);
router.post('/buildings', verifyToken, restrictTo(1), officeController.createBuilding);
router.put('/buildings/:id', verifyToken, restrictTo(1), officeController.updateBuilding);
router.delete('/buildings/:id', verifyToken, restrictTo(1), officeController.deleteBuilding);

// Office routes
router.get('/', officeController.getOffices);
router.post('/', verifyToken, restrictTo(1), officeController.createOffice);
router.put('/:id', verifyToken, restrictTo(1), officeController.updateOffice);
router.delete('/:id', verifyToken, restrictTo(1), officeController.deleteOffice);

module.exports = router;
