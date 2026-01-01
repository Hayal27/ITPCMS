const express = require('express');
const router = express.Router();
const officeController = require('../controllers/officeController');

const verifyToken = require('../middleware/verifyToken');

// Building routes
router.get('/buildings', officeController.getBuildings);
router.post('/buildings', verifyToken, officeController.createBuilding);
router.put('/buildings/:id', verifyToken, officeController.updateBuilding);
router.delete('/buildings/:id', verifyToken, officeController.deleteBuilding);

// Office routes
router.get('/', officeController.getOffices);
router.post('/', verifyToken, officeController.createOffice);
router.put('/:id', verifyToken, officeController.updateOffice);
router.delete('/:id', verifyToken, officeController.deleteOffice);

module.exports = router;
