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
    console.error(`[TRAINING SECURITY] Error:`, error);
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

exports.getAllTrainings = async (req, res) => {
    try {
        const trainings = await query('SELECT * FROM training_workshops ORDER BY event_date ASC');
        const formattedTrainings = trainings.map(t => ({
            ...t,
            tags: t.tags ? JSON.parse(t.tags) : []
        }));
        res.status(200).json(formattedTrainings);
    } catch (error) {
        sendError(res, error);
    }
};

exports.getTrainingById = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        const [training] = await query('SELECT * FROM training_workshops WHERE id = ?', [idNum]);
        if (!training) return res.status(404).json({ message: 'Training not found' });

        training.tags = training.tags ? JSON.parse(training.tags) : [];
        res.status(200).json(training);
    } catch (error) {
        sendError(res, error);
    }
};

exports.createTraining = async (req, res) => {
    try {
        let {
            title, event_date, duration, location, type,
            instructor, capacity, summary, description, tags, link, status
        } = req.body;

        // Sanitize
        title = cleanString(title);
        duration = cleanString(duration);
        location = cleanString(location);
        type = cleanString(type);
        instructor = cleanString(instructor);
        summary = cleanString(summary);
        description = cleanString(description);

        const image_url = req.file ? `/uploads/trainings/${req.file.filename}` : req.body.image_url;

        let parsedTags = tags;
        if (typeof tags === 'string') {
            try {
                parsedTags = JSON.parse(tags);
            } catch (e) {
                parsedTags = tags.split(',').map(s => cleanString(s.trim()));
            }
        }
        // Sanitize tags array
        if (Array.isArray(parsedTags)) {
            parsedTags = parsedTags.map(t => cleanString(t));
        }

        const result = await query(
            `INSERT INTO training_workshops (
                title, image_url, event_date, duration, location, type, 
                instructor, capacity, summary, description, tags, link, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, image_url, event_date, duration, location, type,
                instructor, capacity, summary, description, JSON.stringify(parsedTags || []), link, status || 'Upcoming'
            ]
        );

        res.status(201).json({ message: 'Training created successfully', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateTraining = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        let {
            title, event_date, duration, location, type,
            instructor, capacity, summary, description, tags, link, status
        } = req.body;

        // Sanitize
        title = cleanString(title);
        duration = cleanString(duration);
        location = cleanString(location);
        type = cleanString(type);
        instructor = cleanString(instructor);
        summary = cleanString(summary);
        description = cleanString(description);

        const image_url = req.file ? `/uploads/trainings/${req.file.filename}` : req.body.image_url;

        let parsedTags = tags;
        if (typeof tags === 'string') {
            try {
                parsedTags = JSON.parse(tags);
            } catch (e) {
                parsedTags = tags.split(',').map(s => cleanString(s.trim()));
            }
        }
        // Sanitize tags array
        if (Array.isArray(parsedTags)) {
            parsedTags = parsedTags.map(t => cleanString(t));
        }

        await query(
            `UPDATE training_workshops SET 
                title = ?, image_url = ?, event_date = ?, duration = ?, location = ?, type = ?, 
                instructor = ?, capacity = ?, summary = ?, description = ?, tags = ?, link = ?, status = ?
            WHERE id = ?`,
            [
                title, image_url, event_date, duration, location, type,
                instructor, capacity, summary, description, JSON.stringify(parsedTags || []), link, status, idNum
            ]
        );

        res.status(200).json({ message: 'Training updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteTraining = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        // Find training to get image path before deleting
        const [training] = await query('SELECT image_url FROM training_workshops WHERE id = ?', [idNum]);

        await query('DELETE FROM training_workshops WHERE id = ?', [idNum]);

        // Delete associated file if it exists
        if (training && training.image_url) {
            const filePath = path.join(__dirname, '..', training.image_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ message: 'Training deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};
