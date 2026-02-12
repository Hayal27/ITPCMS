const con = require("../models/db");

// Save a single generated ID
const saveId = async (req, res) => {
    const { content_type, content_id, id_no, name, position, nationality, date_of_issue } = req.body;

    if (!content_type || !content_id || !id_no || !name || !date_of_issue) {
        return res.status(400).json({ message: "Missing required fields for ID saving" });
    }

    try {
        const query = `
      INSERT INTO generated_ids (content_type, content_id, id_no, name, position, nationality, date_of_issue)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        const params = [content_type, content_id, id_no, name, position, nationality, date_of_issue];

        const [result] = await con.promise().query(query, params);
        res.status(201).json({ success: true, message: "ID saved successfully", id: result.insertId });
    } catch (error) {
        console.error("Error saving ID:", error);
        res.status(500).json({ success: false, message: "Error saving ID", error: error.message });
    }
};

// Save bulk IDs
const saveBulkIds = async (req, res) => {
    const { ids } = req.body; // Array of ID objects

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty IDs array" });
    }

    try {
        const values = ids.map(id => [
            id.content_type,
            id.content_id,
            id.id_no,
            id.name,
            id.position,
            id.nationality || 'Ethiopian',
            id.date_of_issue
        ]);

        const query = `
      INSERT INTO generated_ids (content_type, content_id, id_no, name, position, nationality, date_of_issue)
      VALUES ?
    `;

        const [result] = await con.promise().query(query, [values]);
        res.status(201).json({ success: true, message: `${result.affectedRows} IDs saved successfully` });
    } catch (error) {
        console.error("Error batch saving IDs:", error);
        res.status(500).json({ success: false, message: "Error batch saving IDs", error: error.message });
    }
};

// Get ID History
const getIdHistory = async (req, res) => {
    try {
        const [results] = await con.promise().query("SELECT * FROM generated_ids ORDER BY created_at DESC LIMIT 500");
        res.json({ success: true, data: results });
    } catch (error) {
        console.error("Error fetching ID history:", error);
        res.status(500).json({ message: "Error fetching ID history" });
    }
};

module.exports = {
    saveId,
    saveBulkIds,
    getIdHistory
};
