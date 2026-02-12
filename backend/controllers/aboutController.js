const db = require("../models/db.js");
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const validator = require('validator');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Security Utility: Strip ALL HTML tags (For plain text inputs)
const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).trim();
};

// Security Utility: Allow Safe HTML tags (For Rich Text Editor content)
const cleanHtml = (val) => {
    if (typeof val !== 'string') return val;
    // DOMPurify default behavior allows safe HTML (b, i, tables, etc.) and strips scripts
    return DOMPurify.sanitize(val).trim();
};

// Production-Safe Error Handler
const sendError = (res, error, status = 500) => {
    console.error(`[ABOUT SECURITY] Error:`, error);
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'A secure processing error occurred. Data has not been compromised.'
            : error.message
    });
};

// --- Board Members ---

exports.getBoardMembers = (req, res) => {
    const query = "SELECT * FROM board_members ORDER BY order_index ASC, id ASC";
    db.query(query, (err, results) => {
        if (err) return sendError(res, err);
        res.json({ success: true, boardMembers: results });
    });
};

exports.addBoardMember = (req, res) => {
    let { name, english_name, position, bio, image_url, linkedin, twitter, order_index } = req.body;

    if (!name || validator.isEmpty(name)) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Sanitization
    name = cleanString(name);
    english_name = cleanString(english_name || '');
    position = cleanString(position || '');
    bio = cleanString(bio || '');
    linkedin = cleanString(linkedin || '');
    twitter = cleanString(twitter || '');
    const orderIndexNum = parseInt(order_index, 10) || 0;

    let finalImageUrl = image_url || '';
    if (req.file) {
        finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const query = "INSERT INTO board_members (name, english_name, position, bio, image_url, linkedin, twitter, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(query, [name, english_name, position, bio, finalImageUrl, linkedin, twitter, orderIndexNum], (err, result) => {
        if (err) return sendError(res, err);
        res.json({ success: true, message: "Board member added", id: result.insertId });
    });
};

exports.updateBoardMember = (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    let { name, english_name, position, bio, image_url, linkedin, twitter, order_index } = req.body;

    // Sanitization
    name = cleanString(name || '');
    english_name = cleanString(english_name || '');
    position = cleanString(position || '');
    bio = cleanString(bio || '');
    linkedin = cleanString(linkedin || '');
    twitter = cleanString(twitter || '');
    const orderIndexNum = parseInt(order_index, 10) || 0;

    let finalImageUrl = image_url || '';
    if (req.file) {
        finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const query = "UPDATE board_members SET name=?, english_name=?, position=?, bio=?, image_url=?, linkedin=?, twitter=?, order_index=? WHERE id=?";
    db.query(query, [name, english_name, position, bio, finalImageUrl, linkedin, twitter, orderIndexNum, idNum], (err, result) => {
        if (err) return sendError(res, err);
        res.json({ success: true, message: "Board member updated" });
    });
};

exports.deleteBoardMember = (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const query = "DELETE FROM board_members WHERE id=?";
    db.query(query, [idNum], (err, result) => {
        if (err) return sendError(res, err);
        res.json({ success: true, message: "Board member deleted" });
    });
};

// --- Who We Are Sections ---

exports.getWhoWeAreSections = (req, res) => {
    const query = "SELECT * FROM who_we_are_sections WHERE is_active = 1 ORDER BY order_index ASC";
    db.query(query, (err, results) => {
        if (err) return sendError(res, err);
        res.json({ success: true, sections: results });
    });
};

exports.updateWhoWeAreSection = (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    let { title, subtitle, content, image_url, order_index, is_active } = req.body;

    title = cleanString(title || '');
    subtitle = cleanString(subtitle || '');
    // Content allows HTML
    content = cleanHtml(content || '');
    const orderIndexNum = parseInt(order_index, 10) || 0;

    let finalImageUrl = image_url || '';
    if (req.file) {
        finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const query = "UPDATE who_we_are_sections SET title=?, subtitle=?, content=?, image_url=?, order_index=?, is_active=? WHERE id=?";
    db.query(query, [title, subtitle, content, finalImageUrl, orderIndexNum, is_active ? 1 : 0, idNum], (err, result) => {
        if (err) return sendError(res, err);
        res.json({ success: true, message: "Section updated" });
    });
};

exports.addWhoWeAreSection = (req, res) => {
    let { section_type, title, subtitle, content, image_url, order_index } = req.body;

    section_type = cleanString(section_type || 'section');
    title = cleanString(title || '');
    subtitle = cleanString(subtitle || '');
    // Content allows HTML
    content = cleanHtml(content || '');
    const orderIndexNum = parseInt(order_index, 10) || 0;

    let finalImageUrl = image_url || '';
    if (req.file) {
        finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const query = "INSERT INTO who_we_are_sections (section_type, title, subtitle, content, image_url, order_index) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [section_type, title, subtitle, content, finalImageUrl, orderIndexNum], (err, result) => {
        if (err) return sendError(res, err);
        res.json({ success: true, message: "Section added", id: result.insertId });
    });
};

exports.deleteWhoWeAreSection = (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const query = "DELETE FROM who_we_are_sections WHERE id=?";
    db.query(query, [idNum], (err, result) => {
        if (err) return sendError(res, err);
        res.json({ success: true, message: "Section deleted" });
    });
};
