// controllers/userController.js

const util = require('util');
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const con = require("../models/db");

// Add new user (Create Employee -> Create User)
const addUser = async (req, res) => {
  const { fname, lname, email, phone, department_id, role_id, user_name, password } = req.body;

  if (!user_name || !password || !email || !fname || !lname) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = util.promisify(con.query).bind(con);

  try {
    await query('START TRANSACTION');

    // Check if user_name or email already exists to avoid partial inserts
    const existingUsers = await query("SELECT user_id FROM users WHERE user_name = ?", [user_name]);
    if (existingUsers.length > 0) {
      await query('ROLLBACK');
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmp = await query("SELECT employee_id FROM employees WHERE email = ?", [email]);
    if (existingEmp.length > 0) {
      await query('ROLLBACK');
      return res.status(400).json({ message: "Employee with this email already exists" });
    }

    // 1. Create Employee
    const empName = `${fname} ${lname}`;
    const empResult = await query(
      "INSERT INTO employees (name, fname, lname, email, phone, department_id, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [empName, fname, lname, email, phone, department_id, role_id]
    );
    const employee_id = empResult.insertId;

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User
    await query(
      "INSERT INTO users (employee_id, user_name, password, role_id, status) VALUES (?, ?, ?, ?, '1')",
      [employee_id, user_name, hashedPassword, role_id]
    );

    await query('COMMIT');

    console.log(`User created: ${user_name} (Employee ID: ${employee_id})`);
    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    await query('ROLLBACK');
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Error adding user", error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { fname, lname, user_name, phone, department_id, role_id, password } = req.body;

  try {
    const query = util.promisify(con.query).bind(con);

    // Retrieve the employee_id from the users table
    const usersData = await query("SELECT employee_id FROM users WHERE user_id = ?", [user_id]);
    if (!usersData || usersData.length === 0) {
      console.error("User not found for update, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }
    const employee_id = usersData[0].employee_id;

    if (employee_id) {
      await query(
        "UPDATE employees SET fname = ?, lname = ?, phone = ?, department_id = ? WHERE employee_id = ?",
        [fname, lname, phone, department_id, employee_id]
      );
    }

    let updateUserSql = "UPDATE users SET user_name = ?, role_id = ?";
    const queryParams = [user_name, role_id];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateUserSql += ", password = ?";
      queryParams.push(hashedPassword);
    }

    updateUserSql += " WHERE user_id = ?";
    queryParams.push(user_id);

    await query(updateUserSql, queryParams);

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

// Get all roles
const getAllRoles = (req, res) => {
  con.query("SELECT * FROM roles", (err, results) => {
    if (err) {
      console.error("Error retrieving roles:", err);
      return res.status(500).json({ message: "Error retrieving roles", error: err });
    }
    res.json(results);
  });
};

// Get all departments
const getDepartment = (req, res) => {
  con.query("SELECT * FROM departments", (err, results) => {
    if (err) {
      console.error("Error retrieving department:", err);
      return res.status(500).json({ message: "Error retrieving department", error: err });
    }
    res.json(results);
  });
};

// Get all users (including employee details)
const getAllUsers = (req, res) => {
  const query = `
    SELECT u.user_id, u.user_name, u.role_id, u.status, u.created_at,
           e.name, e.fname, e.lname, e.email, e.phone, e.department_id,
           r.role_name
    FROM users u 
    LEFT JOIN employees e ON u.employee_id = e.employee_id
    LEFT JOIN roles r ON u.role_id = r.role_id
    ORDER BY u.created_at DESC
  `;
  con.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving users:", err);
      return res.status(500).json({ message: "Error retrieving users", error: err });
    }
    res.json(results);
  });
};

// Change user status active (1) or inactive (0)
const changeUserStatus = (req, res) => {
  const { user_id } = req.params;
  const { status } = req.body;

  if (status != 0 && status != 1) {
    return res.status(400).json({ message: "Invalid status. Use 0 for inactive and 1 for active." });
  }

  con.query("UPDATE users SET status = ? WHERE user_id = ?", [status, user_id], (err, result) => {
    if (err) {
      console.error("Error updating user status:", err);
      return res.status(500).json({ message: "Error updating user status", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User status updated successfully" });
  });
};

// Delete user
const deleteUser = (req, res) => {
  const { user_id } = req.params;

  // First fetch the user to get the avatar_url
  con.query("SELECT avatar_url FROM users WHERE user_id = ?", [user_id], (fetchErr, results) => {
    if (fetchErr) {
      console.error("Error fetching user for deletion:", fetchErr);
      return res.status(500).json({ message: "Error fetching user", error: fetchErr });
    }

    const avatarUrl = results.length > 0 ? results[0].avatar_url : null;

    con.query("DELETE FROM users WHERE user_id = ?", [user_id], (err, result) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: "Error deleting user", error: err });
      }

      if (result.affectedRows === 0) {
        console.error("User not found for deletion, user_id:", user_id);
        return res.status(404).json({ message: "User not found" });
      }

      // If deletion from DB was successful, delete the avatar file
      if (avatarUrl) {
        const filePath = path.join(__dirname, "..", avatarUrl);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error(`Error deleting avatar file ${filePath}:`, unlinkErr);
          } else {
            console.log(`Deleted avatar file: ${filePath}`);
          }
        });
      }

      console.log("User deleted successfully, user_id:", user_id);
      res.json({ message: "User deleted successfully" });
    });
  });
};

// Get user role for current user
const getUserRoles = (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
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
        return res.status(404).json({ error: "User role not found" });
      }
      res.json(results[0]);
    });
  } catch (error) {
    console.error("Error in getUserRoles:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addUser,
  getUserRoles,
  getAllRoles,
  getDepartment,
  getAllUsers,
  changeUserStatus,
  updateUser,
  deleteUser
};