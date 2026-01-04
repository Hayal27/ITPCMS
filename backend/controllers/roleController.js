const con = require("../models/db");

const roleController = {
    // Get all roles
    getAllRoles: (req, res) => {
        con.query("SELECT * FROM roles", (err, results) => {
            if (err) {
                console.error("Error retrieving roles:", err);
                return res.status(500).json({ message: "Error retrieving roles", error: err });
            }
            res.json(results);
        });
    },

    // Create a new role
    createRole: (req, res) => {
        const { role_name } = req.body;
        if (!role_name) {
            return res.status(400).json({ message: "Role name is required" });
        }

        con.query("INSERT INTO roles (role_name, status) VALUES (?, 1)", [role_name], (err, result) => {
            if (err) {
                console.error("Error creating role:", err);
                return res.status(500).json({ message: "Error creating role", error: err });
            }
            res.status(201).json({ message: "Role created successfully", roleId: result.insertId });
        });
    },

    // Update a role
    updateRole: (req, res) => {
        const { id } = req.params;
        const { role_name, status } = req.body;

        con.query(
            "UPDATE roles SET role_name = ?, status = ? WHERE role_id = ?",
            [role_name, status, id],
            (err, result) => {
                if (err) {
                    console.error("Error updating role:", err);
                    return res.status(500).json({ message: "Error updating role", error: err });
                }
                res.json({ message: "Role updated successfully" });
            }
        );
    },

    // Delete a role
    deleteRole: (req, res) => {
        const { id } = req.params;

        con.query("DELETE FROM roles WHERE role_id = ?", [id], (err, result) => {
            if (err) {
                console.error("Error deleting role:", err);
                return res.status(500).json({ message: "Error deleting role", error: err });
            }
            res.json({ message: "Role deleted successfully" });
        });
    }
};

module.exports = roleController;
