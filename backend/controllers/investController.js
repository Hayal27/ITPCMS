
const db = require('../models/db');
const fs = require('fs');
const path = require('path');

const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

/* --- STEPS --- */

exports.getAllSteps = async (req, res) => {
    try {
        const steps = await query('SELECT * FROM investment_steps ORDER BY step_number ASC');
        res.status(200).json(steps);
    } catch (error) {
        console.error('Error fetching steps:', error);
        res.status(500).json({ message: 'Error fetching steps', error: error.message });
    }
};

exports.createStep = async (req, res) => {
    try {
        const { step_number, title, description, doc_url } = req.body;

        // Handle file upload for document if present
        const finalDocUrl = req.file ? `/uploads/invest/${req.file.filename}` : doc_url;

        const result = await query(
            'INSERT INTO investment_steps (step_number, title, description, doc_url) VALUES (?, ?, ?, ?)',
            [step_number, title, description, finalDocUrl]
        );
        res.status(201).json({ message: 'Step created', id: result.insertId });
    } catch (error) {
        console.error('Error creating step:', error);
        res.status(500).json({ message: 'Error creating step', error: error.message });
    }
};

exports.updateStep = async (req, res) => {
    try {
        const { id } = req.params;
        const { step_number, title, description, doc_url, status } = req.body;

        const finalDocUrl = req.file ? `/uploads/invest/${req.file.filename}` : doc_url;

        await query(
            'UPDATE investment_steps SET step_number=?, title=?, description=?, doc_url=?, status=? WHERE id=?',
            [step_number, title, description, finalDocUrl, status, id]
        );
        res.status(200).json({ message: 'Step updated' });
    } catch (error) {
        console.error('Error updating step:', error);
        res.status(500).json({ message: 'Error updating step', error: error.message });
    }
};

exports.deleteStep = async (req, res) => {
    try {
        const { id } = req.params;

        // Find step to get doc_url
        const [step] = await query('SELECT doc_url FROM investment_steps WHERE id=?', [id]);

        await query('DELETE FROM investment_steps WHERE id=?', [id]);

        if (step && step.doc_url) {
            const filePath = path.join(__dirname, '..', step.doc_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ message: 'Step deleted' });
    } catch (error) {
        console.error('Error deleting step:', error);
        res.status(500).json({ message: 'Error deleting step', error: error.message });
    }
};

/* --- RESOURCES --- */

exports.getAllResources = async (req, res) => {
    try {
        const resources = await query('SELECT * FROM investment_resources ORDER BY id DESC');
        res.status(200).json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Error fetching resources', error: error.message });
    }
};

exports.createResource = async (req, res) => {
    try {
        const { label, icon, file_url, type } = req.body;
        const finalFileUrl = req.file ? `/uploads/invest/${req.file.filename}` : file_url;

        const result = await query(
            'INSERT INTO investment_resources (label, icon, file_url, type) VALUES (?, ?, ?, ?)',
            [label, icon || 'FaFileAlt', finalFileUrl, type || 'document']
        );
        res.status(201).json({ message: 'Resource created', id: result.insertId });
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ message: 'Error creating resource', error: error.message });
    }
};

// Update and Delete for resources can be added similarly if needed
exports.deleteResource = async (req, res) => {
    try {
        const { id } = req.params;

        // Find resource to get file_url
        const [resource] = await query('SELECT file_url FROM investment_resources WHERE id=?', [id]);

        await query('DELETE FROM investment_resources WHERE id=?', [id]);

        if (resource && resource.file_url) {
            const filePath = path.join(__dirname, '..', resource.file_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ message: 'Resource deleted' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ message: 'Error deleting resource', error: error.message });
    }
};
