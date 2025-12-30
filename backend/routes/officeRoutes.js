const express = require('express');
const router = express.Router();
const officeController = require('../controllers/officeController');

// Building routes
router.get('/buildings', officeController.getBuildings);
router.post('/buildings', officeController.createBuilding);
router.put('/buildings/:id', officeController.updateBuilding);
router.delete('/buildings/:id', officeController.deleteBuilding);

// Office routes
router.get('/', officeController.getOffices);
router.post('/', officeController.createOffice);
router.put('/:id', officeController.updateOffice);
router.delete('/:id', officeController.deleteOffice);

module.exports = router;
