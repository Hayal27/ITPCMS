const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken.js');
const { checkSessionExpiration } = require('../middleware/sessionMiddleware');
const { getAllRoles, getAllUsers, updateUser, deleteUser, getDepartment, changeUserStatus } = require('../controllers/userController.js');

// Define routes



// router.get('/roles', getAllRoles);
router.get('/users', verifyToken, getAllUsers);
router.get('/department', verifyToken, getDepartment);

router.put('/:user_id/status', verifyToken, changeUserStatus);



router.put('/updateUser/:user_id', verifyToken, updateUser);
router.delete('/deleteUser/:user_id', verifyToken, deleteUser);

module.exports = router;


