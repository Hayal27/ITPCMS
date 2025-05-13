// employeeRoutes.js
const express = require('express');
const router = express.Router();
// const verifyToken = require ('../middleware/verifyToken')
// const { checkSessionExpiration } = require('../middleware/sessionMiddleware');
const { addEmployee, getAllDepartments, getAllRoles, getAllSupervisors } = require('../controllers/employeeController');

// Define routes

router.post('/addEmployee', addEmployee);
router.get('/departments',  getAllDepartments); // Route to fetch all departments
router.get('/roles',  getAllRoles); // Route to fetch all roles
router.get('/supervisors',  getAllSupervisors); // Route to fetch all supervisors
module.exports = router;


