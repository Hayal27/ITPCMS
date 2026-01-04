const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Publicly available within CMS for the logged in user to get their nav
router.get('/my-nav', verifyToken, menuController.getUserNavigation);

// Admin-only management
router.get('/all', verifyToken, restrictTo(1), menuController.getAllMenus);
router.post('/create', verifyToken, restrictTo(1), menuController.createMenu);
router.put('/:id', verifyToken, restrictTo(1), menuController.updateMenu);
router.delete('/:id', verifyToken, restrictTo(1), menuController.deleteMenu);

// Role Permissions
router.get('/role/:role_id', verifyToken, restrictTo(1), menuController.getRolePermissions);
router.post('/role/:role_id', verifyToken, restrictTo(1), menuController.updateRolePermissions);

// User Permissions
router.get('/user/:user_id', verifyToken, restrictTo(1), menuController.getUserPermissions);
router.post('/user/:user_id', verifyToken, restrictTo(1), menuController.updateUserPermissions);

module.exports = router;
