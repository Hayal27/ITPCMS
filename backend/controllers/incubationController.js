const db = require('../models/db');

const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// --- Programs ---

exports.getPrograms = async (req, res) => {
    try {
        const programs = await query('SELECT * FROM incubation_programs ORDER BY id ASC');
        res.status(200).json(programs);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ message: 'Error fetching programs', error: error.message });
    }
};

exports.createProgram = async (req, res) => {
    try {
        const { title, icon, description, link } = req.body;
        const result = await query(
            'INSERT INTO incubation_programs (title, icon, description, link) VALUES (?, ?, ?, ?)',
            [title, icon, description, link]
        );
        res.status(201).json({ message: 'Program created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating program:', error);
        res.status(500).json({ message: 'Error creating program', error: error.message });
    }
};

exports.updateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, icon, description, link } = req.body;
        await query(
            'UPDATE incubation_programs SET title = ?, icon = ?, description = ?, link = ? WHERE id = ?',
            [title, icon, description, link, id]
        );
        res.status(200).json({ message: 'Program updated successfully' });
    } catch (error) {
        console.error('Error updating program:', error);
        res.status(500).json({ message: 'Error updating program', error: error.message });
    }
};

exports.deleteProgram = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM incubation_programs WHERE id = ?', [id]);
        res.status(200).json({ message: 'Program deleted successfully' });
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).json({ message: 'Error deleting program', error: error.message });
    }
};

// --- Success Stories ---

exports.getSuccessStories = async (req, res) => {
    try {
        const stories = await query('SELECT * FROM incubation_success_stories ORDER BY created_at DESC');
        const formattedStories = stories.map(s => ({
            ...s,
            description: s.description ? JSON.parse(s.description) : [],
            stats: s.stats ? JSON.parse(s.stats) : []
        }));
        res.status(200).json(formattedStories);
    } catch (error) {
        console.error('Error fetching success stories:', error);
        res.status(500).json({ message: 'Error fetching success stories', error: error.message });
    }
};

exports.createSuccessStory = async (req, res) => {
    try {
        const { title, description, stats, link } = req.body;
        const image_url = req.files?.image ? `/uploads/incubation/${req.files.image[0].filename}` : req.body.image_url;

        let parsedDescription = description;
        if (typeof description === 'string') {
            try { parsedDescription = JSON.parse(description); } catch (e) { parsedDescription = [description]; }
        }

        let parsedStats = stats;
        if (typeof stats === 'string') {
            try { parsedStats = JSON.parse(stats); } catch (e) { parsedStats = []; }
        }

        const result = await query(
            'INSERT INTO incubation_success_stories (image_url, title, description, stats, link) VALUES (?, ?, ?, ?, ?)',
            [image_url, title, JSON.stringify(parsedDescription || []), JSON.stringify(parsedStats || []), link]
        );
        res.status(201).json({ message: 'Success story created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating success story:', error);
        res.status(500).json({ message: 'Error creating success story', error: error.message });
    }
};

exports.updateSuccessStory = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, stats, link } = req.body;
        const image_url = req.files?.image ? `/uploads/incubation/${req.files.image[0].filename}` : req.body.image_url;

        let parsedDescription = description;
        if (typeof description === 'string') {
            try { parsedDescription = JSON.parse(description); } catch (e) { parsedDescription = [description]; }
        }

        let parsedStats = stats;
        if (typeof stats === 'string') {
            try { parsedStats = JSON.parse(stats); } catch (e) { parsedStats = []; }
        }

        await query(
            'UPDATE incubation_success_stories SET image_url = ?, title = ?, description = ?, stats = ?, link = ? WHERE id = ?',
            [image_url, title, JSON.stringify(parsedDescription || []), JSON.stringify(parsedStats || []), link, id]
        );
        res.status(200).json({ message: 'Success story updated successfully' });
    } catch (error) {
        console.error('Error updating success story:', error);
        res.status(500).json({ message: 'Error updating success story', error: error.message });
    }
};

exports.deleteSuccessStory = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM incubation_success_stories WHERE id = ?', [id]);
        res.status(200).json({ message: 'Success story deleted successfully' });
    } catch (error) {
        console.error('Error deleting success story:', error);
        res.status(500).json({ message: 'Error deleting success story', error: error.message });
    }
};
