const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { hasMenuPermission } = require('../middleware/menuPermissionMiddleware');
const {
    getAllIdCardPersons,
    addIdCardPerson,
    batchAddIdCardPersons,
    updateIdCardPerson,
    deleteIdCardPerson,
    getAllIdTemplates,
    saveIdTemplate,
    updateIdTemplate,
    getPublicIdCardPerson
} = require('../controllers/idCardPersonController');
const { uploadPhoto, handlePhotoUpload } = require('../controllers/imageUploadController');

// All routes protected by token verification and Menu Permission checks
router.get('/all', verifyToken, hasMenuPermission('/admin/employees/id-cards'), getAllIdCardPersons);
router.post('/add', verifyToken, hasMenuPermission('/admin/employees/id-cards'), addIdCardPerson);
router.post('/batch', verifyToken, hasMenuPermission('/admin/employees/id-cards'), batchAddIdCardPersons);
router.post('/upload-photo', verifyToken, hasMenuPermission('/admin/employees/id-cards'), uploadPhoto, handlePhotoUpload);
router.get('/templates', verifyToken, hasMenuPermission('/admin/employees/id-cards'), getAllIdTemplates);
router.post('/templates', verifyToken, hasMenuPermission('/admin/employees/id-cards'), saveIdTemplate);
router.put('/templates/:id', verifyToken, hasMenuPermission('/admin/employees/id-cards'), updateIdTemplate);
router.put('/:id', verifyToken, hasMenuPermission('/admin/employees/id-cards'), updateIdCardPerson);
router.delete('/:id', verifyToken, hasMenuPermission('/admin/employees/id-cards'), deleteIdCardPerson);
router.get('/public/:idNumber', getPublicIdCardPerson);

module.exports = router;
