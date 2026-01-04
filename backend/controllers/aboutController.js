const db = process.env.USE_REMOTE_DB === "true"
    ? require("../models/db.remote.js")
    : require("../models/db.js");

// --- Board Members ---

exports.getBoardMembers = (req, res) => {
    const query = "SELECT * FROM board_members ORDER BY order_index ASC, id ASC";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, boardMembers: results });
    });
};

exports.addBoardMember = (req, res) => {
    const { name, english_name, position, bio, image_url, linkedin, twitter, order_index } = req.body;

    // Handle image: use uploaded file path if available, otherwise use provided URL
    let finalImageUrl = image_url || '';
    if (req.file) {
        finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const query = "INSERT INTO board_members (name, english_name, position, bio, image_url, linkedin, twitter, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(query, [name, english_name, position, bio, finalImageUrl, linkedin, twitter, order_index || 0], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Board member added", id: result.insertId });
    });
};

exports.updateBoardMember = (req, res) => {
    const { id } = req.params;
    const { name, english_name, position, bio, image_url, linkedin, twitter, order_index } = req.body;

    // Handle image: use uploaded file path if available, otherwise use provided URL
    let finalImageUrl = image_url || '';
    if (req.file) {
        finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const query = "UPDATE board_members SET name=?, english_name=?, position=?, bio=?, image_url=?, linkedin=?, twitter=?, order_index=? WHERE id=?";
    db.query(query, [name, english_name, position, bio, finalImageUrl, linkedin, twitter, order_index, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Board member updated" });
    });
};

exports.deleteBoardMember = (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM board_members WHERE id=?";
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Board member deleted" });
    });
};

// --- Who We Are Sections ---

exports.getWhoWeAreSections = (req, res) => {
    const query = "SELECT * FROM who_we_are_sections WHERE is_active = 1 ORDER BY order_index ASC";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, sections: results });
    });
};

exports.updateWhoWeAreSection = (req, res) => {
    const { id } = req.params;
    const { title, subtitle, content, image_url, order_index, is_active } = req.body;

    // Handle image: use uploaded file path if available, otherwise use provided URL
    let finalImageUrl = image_url || '';
    if (req.file) {
        finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const query = "UPDATE who_we_are_sections SET title=?, subtitle=?, content=?, image_url=?, order_index=?, is_active=? WHERE id=?";
    db.query(query, [title, subtitle, content, finalImageUrl, order_index, is_active, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Section updated" });
    });
};

exports.addWhoWeAreSection = (req, res) => {
    const { section_type, title, subtitle, content, image_url, order_index } = req.body;

    // Handle image: use uploaded file path if available, otherwise use provided URL
    let finalImageUrl = image_url || '';
    if (req.file) {
        finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const query = "INSERT INTO who_we_are_sections (section_type, title, subtitle, content, image_url, order_index) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [section_type, title, subtitle, content, finalImageUrl, order_index || 0], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Section added", id: result.insertId });
    });
};

exports.deleteWhoWeAreSection = (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM who_we_are_sections WHERE id=?";
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Section deleted" });
    });
};
