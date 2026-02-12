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
    console.error(`[INCUBATION SECURITY] Error:`, error);
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

// --- Programs ---

exports.getPrograms = async (req, res) => {
    try {
        const programs = await query('SELECT * FROM incubation_programs ORDER BY id ASC');
        res.status(200).json(programs);
    } catch (error) {
        sendError(res, error);
    }
};

exports.createProgram = async (req, res) => {
    try {
        let { title, icon, description, link } = req.body;

        // Sanitize
        title = cleanString(title);
        icon = cleanString(icon);
        description = cleanString(description);

        const result = await query(
            'INSERT INTO incubation_programs (title, icon, description, link) VALUES (?, ?, ?, ?)',
            [title, icon, description, link]
        );
        res.status(201).json({ message: 'Program created successfully', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateProgram = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        let { title, icon, description, link } = req.body;

        title = cleanString(title);
        icon = cleanString(icon);
        description = cleanString(description);

        await query(
            'UPDATE incubation_programs SET title = ?, icon = ?, description = ?, link = ? WHERE id = ?',
            [title, icon, description, link, idNum]
        );
        res.status(200).json({ message: 'Program updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteProgram = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        await query('DELETE FROM incubation_programs WHERE id = ?', [idNum]);
        res.status(200).json({ message: 'Program deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// --- Success Stories ---

exports.getSuccessStories = async (req, res) => {
    try {
        const stories = await query('SELECT * FROM incubation_success_stories ORDER BY created_at DESC');
        const formattedStories = stories.map(s => {
            let parsedDescription = [];
            if (s.description) {
                try {
                    parsedDescription = typeof s.description === 'string' ? JSON.parse(s.description) : s.description;
                } catch (e) {
                    parsedDescription = [s.description]; // Fallback to single item array
                }
            }

            let parsedStats = [];
            if (s.stats) {
                try {
                    parsedStats = typeof s.stats === 'string' ? JSON.parse(s.stats) : s.stats;
                } catch (e) {
                    parsedStats = []; // Fallback to empty stats
                }
            }

            return {
                ...s,
                description: Array.isArray(parsedDescription) ? parsedDescription : [parsedDescription],
                stats: Array.isArray(parsedStats) ? parsedStats : []
            };
        });
        res.status(200).json(formattedStories);
    } catch (error) {
        sendError(res, error);
    }
};

exports.createSuccessStory = async (req, res) => {
    try {
        let { title, description, stats, link } = req.body;
        const image_url = req.files?.image ? `/uploads/incubation/${req.files.image[0].filename}` : req.body.image_url;

        title = cleanString(title);

        let parsedDescription = description;
        if (typeof description === 'string') {
            try {
                parsedDescription = JSON.parse(description);
            } catch (e) {
                parsedDescription = [cleanString(description)];
            }
        }
        // Sanitize description array
        if (Array.isArray(parsedDescription)) {
            parsedDescription = parsedDescription.map(d => cleanString(d));
        }

        let parsedStats = stats;
        if (typeof stats === 'string') {
            try { parsedStats = JSON.parse(stats); } catch (e) { parsedStats = []; }
        }
        // Sanitize stats array
        if (Array.isArray(parsedStats)) {
            parsedStats = parsedStats.map(s => ({
                number: cleanString(s.number),
                label: cleanString(s.label)
            }));
        }

        const result = await query(
            'INSERT INTO incubation_success_stories (image_url, title, description, stats, link) VALUES (?, ?, ?, ?, ?)',
            [image_url, title, JSON.stringify(parsedDescription || []), JSON.stringify(parsedStats || []), link]
        );
        res.status(201).json({ message: 'Success story created successfully', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateSuccessStory = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        let { title, description, stats, link } = req.body;
        const image_url = req.files?.image ? `/uploads/incubation/${req.files.image[0].filename}` : req.body.image_url;

        title = cleanString(title);

        let parsedDescription = description;
        if (typeof description === 'string') {
            try { parsedDescription = JSON.parse(description); } catch (e) { parsedDescription = [cleanString(description)]; }
        }
        if (Array.isArray(parsedDescription)) {
            parsedDescription = parsedDescription.map(d => cleanString(d));
        }

        let parsedStats = stats;
        if (typeof stats === 'string') {
            try { parsedStats = JSON.parse(stats); } catch (e) { parsedStats = []; }
        }
        if (Array.isArray(parsedStats)) {
            parsedStats = parsedStats.map(s => ({
                number: cleanString(s.number),
                label: cleanString(s.label)
            }));
        }

        await query(
            'UPDATE incubation_success_stories SET image_url = ?, title = ?, description = ?, stats = ?, link = ? WHERE id = ?',
            [image_url, title, JSON.stringify(parsedDescription || []), JSON.stringify(parsedStats || []), link, idNum]
        );
        res.status(200).json({ message: 'Success story updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteSuccessStory = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        // Find story to get image path before deleting
        const [story] = await query('SELECT image_url FROM incubation_success_stories WHERE id = ?', [idNum]);

        await query('DELETE FROM incubation_success_stories WHERE id = ?', [idNum]);

        if (story && story.image_url) {
            const filePath = path.join(__dirname, '..', story.image_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ message: 'Success story deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};
