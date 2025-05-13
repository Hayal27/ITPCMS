// controllers/userController.js

const con = require("../models/db"); // Assumes you have a db.js file that exports the database connection
const bcrypt = require('bcrypt');
const util = require('util');



const updateUser = async (req, res) => {
  const { user_id } = req.params;
  // Expecting role_id (not role_name) since the users table only has role_id field.
  const { fname, lname, user_name, phone, department_id, role_id } = req.body;
  
  try {
    // Promisify the query method for async/await usage
    const query = util.promisify(con.query).bind(con);
    
    // Retrieve the employee_id from the users table
    const usersData = await query("SELECT employee_id FROM users WHERE user_id = ?", [user_id]);
    if (!usersData || usersData.length === 0) {
      console.error("User not found for update, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }
    const employee_id = usersData[0].employee_id;
    
    // If an employee_id exists, update the employees table for employee details
    if (employee_id) {
      await query(
        "UPDATE employees SET fname = ?, lname = ?, phone = ?, department_id = ? WHERE employee_id = ?",
        [fname, lname, phone, department_id, employee_id]
      );
      console.log("Employee details updated for employee_id:", employee_id);
    }
    
    // Update the users table with account details (user_name and role_id)
    await query(
      "UPDATE users SET user_name = ?, role_id = ? WHERE user_id = ?",
      [user_name, role_id, user_id]
    );
    console.log("User account updated for user_id:", user_id);
    
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};




// Get all roles
const getAllRoles = (req, res) => {
  con.query("SELECT * FROM role", (err, results) => {
    if (err) {
      console.error("Error retrieving roles:", err);
      return res.status(500).json({ message: "Error retrieving roles", error: err });
    }
    console.log("Fetched roles:", results);
    res.json(results);
  });
};

// Get all departments
const getDepartment = (req, res) => {
  con.query("SELECT * FROM department", (err, results) => {
    if (err) {
      console.error("Error retrieving department:", err);
      return res.status(500).json({ message: "Error retrieving department", error: err });
    }
    console.log("Fetched departments:", results);
    res.json(results);
  });
};

// Get all users (including employee details if available)
// We use LEFT JOIN with employees table so that employee fields (fname, lname, phone) override users fields

const getAllUsers = (req, res) => {
  const query = `
    SELECT u.*, e.*
    FROM users u 
    LEFT JOIN employees e ON u.employee_id = e.employee_id
  `;
  con.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving users:", err);
      return res.status(500).json({ message: "Error retrieving users", error: err });
    }
    console.log("Fetched users:", results);
    res.json(results);
  });
};


// Change user status active (1) or inactive (0)
const changeUserStatus = (req, res) => {
  const { user_id } = req.params;
  const { status } = req.body;

  if (status !== 0 && status !== 1) {
    console.error("Invalid status provided:", status);
    return res.status(400).json({ message: "Invalid status. Use 0 for inactive and 1 for active." });
  }

  con.query("UPDATE users SET status = ? WHERE user_id = ?", [status, user_id], (err, result) => {
    if (err) {
      console.error("Error updating user status:", err);
      return res.status(500).json({ message: "Error updating user status", error: err });
    }

    if (result.affectedRows === 0) {
      console.error("User not found for update, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User status updated successfully for user_id:", user_id, "New status:", status);
    res.json({ message: "User status updated successfully" });
  });
};



// Delete user - using correct table name (users)
const deleteUser = (req, res) => {
  const { user_id } = req.params;

  con.query("DELETE FROM users WHERE user_id = ?", [user_id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ message: "Error deleting user", error: err });
    }

    if (result.affectedRows === 0) {
      console.error("User not found for deletion, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User deleted successfully, user_id:", user_id);
    res.json({ message: "User deleted successfully" });
  });
};

// Get user role for current user (using req.user_id from middleware)
const getUserRoles = (req, res) => {
  try {
    const user_id = req.user_id;
    if (!user_id) {
      console.error("User ID not provided in request.");
      return res.status(400).json({ error: "User ID not provided" });
    }
    const sql = `
      SELECT r.role_name
      FROM roles r
      INNER JOIN users u ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `;
    con.query(sql, [user_id], (err, results) => {
      if (err) {
        console.error("Database query error for user roles:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        console.error("User role not found for user_id:", user_id);
        return res.status(404).json({ error: "User role not found" });
      }
      console.log("Fetched user role for user_id:", user_id, results[0]);
      res.json(results[0]);
    });
  } catch (error) {
    console.error("Error in getUserRoles:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};




module.exports = {
 
  getUserRoles,
 
  getAllRoles,
  getDepartment,
  getAllUsers, // Updated function name here
  changeUserStatus,
  updateUser,
  deleteUser,
  changeUserStatus,
  updateUser
};