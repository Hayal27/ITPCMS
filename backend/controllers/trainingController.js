
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

exports.getAllTrainings = async (req, res) => {
    try {
        const trainings = await query('SELECT * FROM training_workshops ORDER BY event_date ASC');
        const formattedTrainings = trainings.map(t => ({
            ...t,
            tags: t.tags ? JSON.parse(t.tags) : []
        }));
        res.status(200).json(formattedTrainings);
    } catch (error) {
        console.error('Error fetching trainings:', error);
        res.status(500).json({ message: 'Error fetching trainings', error: error.message });
    }
};

exports.getTrainingById = async (req, res) => {
    try {
        const { id } = req.params;
        const [training] = await query('SELECT * FROM training_workshops WHERE id = ?', [id]);
        if (!training) return res.status(404).json({ message: 'Training not found' });

        training.tags = training.tags ? JSON.parse(training.tags) : [];
        res.status(200).json(training);
    } catch (error) {
        console.error('Error fetching training:', error);
        res.status(500).json({ message: 'Error fetching training', error: error.message });
    }
};

exports.createTraining = async (req, res) => {
    try {
        const {
            title, event_date, duration, location, type,
            instructor, capacity, summary, description, tags, link, status
        } = req.body;

        const image_url = req.file ? `/uploads/trainings/${req.file.filename}` : req.body.image_url;

        let parsedTags = tags;
        if (typeof tags === 'string') {
            try { parsedTags = JSON.parse(tags); } catch (e) { parsedTags = tags.split(',').map(s => s.trim()); }
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
        console.error('Error creating training:', error);
        res.status(500).json({ message: 'Error creating training', error: error.message });
    }
};

exports.updateTraining = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, event_date, duration, location, type,
            instructor, capacity, summary, description, tags, link, status
        } = req.body;

        const image_url = req.file ? `/uploads/trainings/${req.file.filename}` : req.body.image_url;

        let parsedTags = tags;
        if (typeof tags === 'string') {
            try { parsedTags = JSON.parse(tags); } catch (e) { parsedTags = tags.split(',').map(s => s.trim()); }
        }

        await query(
            `UPDATE training_workshops SET 
                title = ?, image_url = ?, event_date = ?, duration = ?, location = ?, type = ?, 
                instructor = ?, capacity = ?, summary = ?, description = ?, tags = ?, link = ?, status = ?
            WHERE id = ?`,
            [
                title, image_url, event_date, duration, location, type,
                instructor, capacity, summary, description, JSON.stringify(parsedTags || []), link, status, id
            ]
        );

        res.status(200).json({ message: 'Training updated successfully' });
    } catch (error) {
        console.error('Error updating training:', error);
        res.status(500).json({ message: 'Error updating training', error: error.message });
    }
};

exports.deleteTraining = async (req, res) => {
    try {
        const { id } = req.params;

        // Find training to get image path before deleting
        const [training] = await query('SELECT image_url FROM training_workshops WHERE id = ?', [id]);

        await query('DELETE FROM training_workshops WHERE id = ?', [id]);

        // Delete associated file if it exists
        if (training && training.image_url) {
            const filePath = path.join(__dirname, '..', training.image_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ message: 'Training deleted successfully' });
    } catch (error) {
        console.error('Error deleting training:', error);
        res.status(500).json({ message: 'Error deleting training', error: error.message });
    }
};
