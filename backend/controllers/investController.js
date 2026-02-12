
const db = require('../models/db');
const fs = require('fs');
const path = require('path');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Production-Safe Error Handler
const sendError = (res, error, status = 500) => {
    console.error(`[INVEST SECURITY] Error:`, error);
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'A secure processing error occurred. Detailed logs are available to admins.'
            : error.message
    });
};

// Backend Sanitizer
const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).trim();
};

/* --- STEPS --- */

exports.getAllSteps = async (req, res) => {
    try {
        const steps = await query('SELECT * FROM investment_steps ORDER BY step_number ASC');
        res.status(200).json(steps);
    } catch (error) {
        sendError(res, error);
    }
};

exports.createStep = async (req, res) => {
    try {
        let { step_number, title, description, doc_url } = req.body;

        // Sanitize
        title = cleanString(title);
        description = cleanString(description);

        // Handle file upload for document if present
        const finalDocUrl = req.file ? `/uploads/invest/${req.file.filename}` : doc_url;

        const result = await query(
            'INSERT INTO investment_steps (step_number, title, description, doc_url) VALUES (?, ?, ?, ?)',
            [step_number, title, description, finalDocUrl]
        );
        res.status(201).json({ message: 'Step created', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateStep = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        let { step_number, title, description, doc_url, status } = req.body;

        title = cleanString(title);
        description = cleanString(description);

        const finalDocUrl = req.file ? `/uploads/invest/${req.file.filename}` : doc_url;

        await query(
            'UPDATE investment_steps SET step_number=?, title=?, description=?, doc_url=?, status=? WHERE id=?',
            [step_number, title, description, finalDocUrl, status, idNum]
        );
        res.status(200).json({ message: 'Step updated' });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteStep = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        // Find step to get doc_url
        const [step] = await query('SELECT doc_url FROM investment_steps WHERE id=?', [idNum]);

        await query('DELETE FROM investment_steps WHERE id=?', [idNum]);

        if (step && step.doc_url) {
            const filePath = path.join(__dirname, '..', step.doc_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ message: 'Step deleted' });
    } catch (error) {
        sendError(res, error);
    }
};

/* --- RESOURCES --- */

exports.getAllResources = async (req, res) => {
    try {
        const resources = await query('SELECT * FROM investment_resources ORDER BY id DESC');
        res.status(200).json(resources);
    } catch (error) {
        sendError(res, error);
    }
};

exports.createResource = async (req, res) => {
    try {
        let { label, icon, file_url, type } = req.body;

        label = cleanString(label);
        icon = cleanString(icon);

        const finalFileUrl = req.file ? `/uploads/invest/${req.file.filename}` : file_url;

        const result = await query(
            'INSERT INTO investment_resources (label, icon, file_url, type) VALUES (?, ?, ?, ?)',
            [label, icon || 'FaFileAlt', finalFileUrl, type || 'document']
        );
        res.status(201).json({ message: 'Resource created', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

// Update and Delete for resources can be added similarly if needed
exports.deleteResource = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        // Find resource to get file_url
        const [resource] = await query('SELECT file_url FROM investment_resources WHERE id=?', [idNum]);

        await query('DELETE FROM investment_resources WHERE id=?', [idNum]);

        if (resource && resource.file_url) {
            const filePath = path.join(__dirname, '..', resource.file_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ message: 'Resource deleted' });
    } catch (error) {
        sendError(res, error);
    }
};
