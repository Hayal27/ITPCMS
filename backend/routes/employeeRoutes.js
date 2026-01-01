// employeeRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { addEmployee, getAllDepartments, getAllRoles, getAllSupervisors } = require('../controllers/employeeController');

// Define routes

router.post('/addEmployee', verifyToken, addEmployee);
router.get('/departments', verifyToken, getAllDepartments); // Route to fetch all departments
router.get('/roles', verifyToken, getAllRoles); // Route to fetch all roles
router.get('/supervisors', verifyToken, getAllSupervisors); // Route to fetch all supervisors
module.exports = router;


