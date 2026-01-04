const db = require('../models/db');
const auditLogController = require('./auditLogController');

exports.getAllEvents = (req, res) => {
    const query = 'SELECT * FROM events ORDER BY date DESC, createdAt DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch events' });
        }
        const formatted = results.map(e => {
            try {
                e.image = JSON.parse(e.image);
            } catch (err) {
                // Not JSON, keep as is
            }
            return {
                ...e,
                tags: e.tags ? JSON.parse(e.tags) : []
            };
        });
        res.json({ success: true, events: formatted });
    });
};

exports.getEventById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM events WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching event:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch event' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        const event = results[0];
        try {
            event.image = JSON.parse(event.image);
        } catch (err) { }
        event.tags = event.tags ? JSON.parse(event.tags) : [];
        res.json({ success: true, event });
    });
};

exports.createEvent = (req, res) => {
    const { title, date, time, venue, description, featured, registrationLink, capacity, youtubeUrl, imageAltText, tags } = req.body;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
        const files = req.files.filter(f => f.fieldname === 'imageFiles');
        imagePaths = files.map(file => `/uploads/${file.filename}`);
    }

    const query = `
    INSERT INTO events (title, date, time, venue, image, description, featured, registrationLink, capacity, youtubeUrl, imageAltText, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    const values = [
        title, date, time, venue, JSON.stringify(imagePaths), description,
        featured === 'true' || featured === true ? 1 : 0,
        registrationLink, capacity, youtubeUrl, imageAltText,
        JSON.stringify(tags ? (Array.isArray(tags) ? tags : [tags]) : [])
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating event:', err);
            return res.status(500).json({ success: false, message: 'Failed to create event' });
        }

        auditLogController.logActivity(req, 'CREATE', 'Event', result.insertId, { title });
        res.json({ success: true, message: 'Event created successfully', id: result.insertId });
    });
};

exports.updateEvent = (req, res) => {
    const { id } = req.params;
    const { title, date, time, venue, description, featured, registrationLink, capacity, youtubeUrl, imageAltText, tags } = req.body;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
        const files = req.files.filter(f => f.fieldname === 'imageFiles');
        imagePaths = files.map(file => `/uploads/${file.filename}`);
    }

    let query = `
    UPDATE events 
    SET title=?, date=?, time=?, venue=?, description=?, featured=?, registrationLink=?, capacity=?, youtubeUrl=?, imageAltText=?, tags=?
  `;
    const values = [
        title, date, time, venue, description,
        featured === 'true' || featured === true ? 1 : 0,
        registrationLink, capacity, youtubeUrl, imageAltText,
        JSON.stringify(tags ? (Array.isArray(tags) ? tags : [tags]) : [])
    ];

    if (imagePaths.length > 0) {
        query += `, image=?`;
        values.push(JSON.stringify(imagePaths));
    }

    query += ` WHERE id=?`;
    values.push(id);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating event:', err);
            return res.status(500).json({ success: false, message: 'Failed to update event' });
        }
        auditLogController.logActivity(req, 'UPDATE', 'Event', id, { title });
        res.json({ success: true, message: 'Event updated successfully' });
    });
};

exports.deleteEvent = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM events WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting event:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete event' });
        }
        auditLogController.logActivity(req, 'DELETE', 'Event', id);
        res.json({ success: true, message: 'Event deleted successfully' });
    });
};
