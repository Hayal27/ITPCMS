const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken.js');
const idController = require('../controllers/idController.js');
const { hasMenuPermission } = require('../middleware/menuPermissionMiddleware.js');

// Save single generated ID
router.post('/save', verifyToken, hasMenuPermission('/tools/id-generator'), idController.saveId);

// Save bulk generated IDs
router.post('/save-bulk', verifyToken, hasMenuPermission('/tools/id-generator'), idController.saveBulkIds);

// Get IDs by content type/id
router.get('/history', verifyToken, hasMenuPermission('/tools/id-generator'), idController.getIdHistory);

module.exports = router;
