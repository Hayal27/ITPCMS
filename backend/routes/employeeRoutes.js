// employeeRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken.js');
const { addEmployee, getAllDepartments, getAllRoles, getAllSupervisors } = require('../controllers/employeeController');

const { restrictTo } = require('../middleware/roleMiddleware.js');

// Define routes - protected by verifyToken and Admin restriction
router.post('/addEmployee', verifyToken, restrictTo(1), addEmployee);
router.get('/departments', verifyToken, restrictTo(1), getAllDepartments);
router.get('/roles', verifyToken, restrictTo(1), getAllRoles);
router.get('/supervisors', verifyToken, restrictTo(1), getAllSupervisors);
router.get('/all', verifyToken, restrictTo(1), require('../controllers/employeeController').getAllEmployees);
router.post('/batch', verifyToken, restrictTo(1), require('../controllers/employeeController').batchAddEmployees);
module.exports = router;


