const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Base path: /api/roles

// Get all roles
router.get('/', verifyToken, restrictTo(1), roleController.getAllRoles);

// Create a new role
router.post('/', verifyToken, restrictTo(1), roleController.createRole);

// Update a role
router.put('/:id', verifyToken, restrictTo(1), roleController.updateRole);

// Delete a role
router.delete('/:id', verifyToken, restrictTo(1), roleController.deleteRole);

module.exports = router;
