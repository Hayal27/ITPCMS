const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken.js');
const userController = require('../controllers/userController.js');
const { restrictTo } = require('../middleware/roleMiddleware.js');
const { hasMenuPermission } = require('../middleware/menuPermissionMiddleware.js');
const auditMiddleware = require('../middleware/auditMiddleware.js');

// Define routes - all protected by verifyToken and Admin-only
router.get('/users', verifyToken, restrictTo(1), hasMenuPermission('/users/all'), userController.getAllUsers);
router.get('/department', verifyToken, restrictTo(1), userController.getDepartment);
router.put('/:user_id/status', verifyToken, restrictTo(1), hasMenuPermission('/users/all'), auditMiddleware('UPDATE_STATUS', 'User'), userController.changeUserStatus);
router.post('/addUser', verifyToken, restrictTo(1), hasMenuPermission('/users/add'), auditMiddleware('CREATE', 'User'), userController.addUser);
router.put('/updateUser/:user_id', verifyToken, restrictTo(1), hasMenuPermission('/users/all'), auditMiddleware('UPDATE', 'User'), userController.updateUser);
router.delete('/deleteUser/:user_id', verifyToken, restrictTo(1), hasMenuPermission('/users/all'), auditMiddleware('DELETE', 'User'), userController.deleteUser);

module.exports = router;
