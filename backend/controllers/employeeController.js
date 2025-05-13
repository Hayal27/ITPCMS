// employeeController.js
// importing db connection
const con = require("../models/db");
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const util = require("util");
// Function to add a new employee and create a corresponding user

const addEmployee = async (req, res) => {
    const { 
        name, role_id, department_id, supervisor_id, fname, lname, email, phone, sex 
    } = req.body;
  
    try {
        // Promisify the query method for easier async handling
        const query = util.promisify(con.query).bind(con);
  
        // Insert the new employee into the Employees table
        const employeeResult = await query(
            'INSERT INTO Employees (name, role_id, department_id, supervisor_id, fname, lname, email, phone, sex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, role_id, department_id || null, supervisor_id || null, fname, lname, email, phone, sex]
        );
  
        // Check if the employee insertion was successful
        if (!employeeResult || !employeeResult.insertId) {
            console.error("Employee insertion failed.");
            return res.status(500).json({ message: "Failed to insert employee data into the database." });
        }
  
        // Get the employee ID of the newly created employee
        const employee_id = employeeResult.insertId;
  
        // Set up default username and password for the new user
        const defaultUsername = email; // Username set as employee's email
        const defaultPassword = 'itp@123'; // Default password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10); // Hash the password for security
  
        // Insert the user data into the Users table with role_id included
        const userResult = await query(
            'INSERT INTO users (employee_id, user_name, password, role_id) VALUES (?, ?, ?, ?)',
            [employee_id, defaultUsername, hashedPassword, role_id]
        );
  
        // Check if the user insertion was successful
        if (!userResult || !userResult.insertId) {
            console.error("User account creation failed.");
            return res.status(500).json({ message: "Failed to create user account for employee." });
        }
  
        // Respond with success message and employee ID
        res.json({ employee_id, message: 'Employee and user created successfully.' });
    } catch (error) {
        console.error("Error registering employee and user:", error);
        res.status(500).json({ message: "Failed to register employee and create user." });
    }
  };


// Function to fetch all departments
const getAllDepartments = (req, res) => {
    con.query('SELECT * FROM departments', (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            return res.status(500).json({ message: 'Error fetching departments' });
        }
        res.json(results);
    });
};

// Function to fetch all roles
const getAllRoles = (req, res) => {
    con.query('SELECT * FROM roles', (err, results) => {
        if (err) {
            console.error('Error fetching roles:', err);
            return res.status(500).json({ message: 'Error fetching roles' });
        }
        res.json(results); // Send role_name and role_name to the frontend
    });
};

// Function to fetch all supervisors
const getAllSupervisors = (req, res) => {
    con.query('SELECT * FROM employees', (err, results) => {
        if (err) {
            console.error('Error fetching supervisors:', err);
            return res.status(500).json({ message: 'Error fetching supervisors' });
        }
        res.json(results);
    });
};

// Exporting the functions for use in routes
module.exports = {
    getAllDepartments,
    getAllRoles,
    getAllSupervisors,
    addEmployee
};
