const db = require('../models/db');
const auditLogController = require('./auditLogController');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const validator = require('validator');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Security Utility: Strip ALL HTML tags
const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).trim();
};

// Production-Safe Error Handler
const sendError = (res, error, status = 500) => {
    console.error(`[MEDIA SECURITY] Error:`, error);
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'A secure processing error occurred. Data integrity is maintained.'
            : error.message
    });
};

exports.getMediaItems = (req, res) => {
    const query = 'SELECT * FROM media_gallery ORDER BY date DESC, created_at DESC';
    db.query(query, (err, results) => {
        if (err) return sendError(res, err);
        const formatted = results.map(m => ({
            ...m,
            date: m.date ? m.date.toISOString().split('T')[0] : null
        }));
        res.json({ success: true, mediaItems: formatted });
    });
};

exports.addMediaItem = (req, res) => {
    let { title, date, category, type, description, youtubeUrl } = req.body;

    if (!title || validator.isEmpty(title)) {
        return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Sanitization
    title = cleanString(title);
    category = cleanString(category || '');
    type = cleanString(type || 'image');
    description = cleanString(description || '');
    youtubeUrl = cleanString(youtubeUrl || '');

    let poster = null;
    const mediaFileEntries = [];

    if (req.files && req.files.length > 0) {
        const posterFile = req.files.find(f => f.fieldname === 'posterFile');
        if (posterFile) {
            poster = `/uploads/${posterFile.filename}`;
        }

        const mediaFiles = req.files.filter(f => f.fieldname === 'mediaFiles');
        mediaFiles.forEach(f => {
            mediaFileEntries.push(`/uploads/${f.filename}`);
        });
    }

    if (mediaFileEntries.length === 0) {
        if (type === 'video' && youtubeUrl) {
            mediaFileEntries.push(youtubeUrl);
        } else if (req.body.src) {
            mediaFileEntries.push(cleanString(req.body.src));
        }
    }

    if (mediaFileEntries.length === 0) {
        return res.status(400).json({ success: false, message: 'No media source provided (file or URL)' });
    }

    const sql = `
        INSERT INTO media_gallery (title, date, category, type, description, src, poster, youtube_url_original)
        VALUES ?
    `;

    const values = mediaFileEntries.map(src => [
        title, date, category, type, description, src, poster, youtubeUrl
    ]);

    db.query(sql, [values], (err, result) => {
        if (err) return sendError(res, err);

        auditLogController.logActivity(req, 'CREATE', 'Media', result.insertId, { title, count: mediaFileEntries.length });
        res.json({
            success: true,
            message: mediaFileEntries.length > 1 ? `${mediaFileEntries.length} items added successfully` : 'Media item added successfully',
            id: result.insertId
        });
    });
};

exports.updateMediaItem = (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    let { title, date, category, type, description, youtubeUrl } = req.body;

    // Sanitization
    title = cleanString(title || '');
    category = cleanString(category || '');
    type = cleanString(type || '');
    description = cleanString(description || '');
    youtubeUrl = cleanString(youtubeUrl || '');

    let src = req.body.src ? cleanString(req.body.src) : null;
    let poster = req.body.poster ? cleanString(req.body.poster) : null;

    if (req.files && req.files.length > 0) {
        const mediaFile = req.files.find(f => f.fieldname === 'mediaFiles');
        if (mediaFile) {
            src = `/uploads/${mediaFile.filename}`;
        }

        const posterFile = req.files.find(f => f.fieldname === 'posterFile');
        if (posterFile) {
            poster = `/uploads/${posterFile.filename}`;
        }
    }

    let sql = 'UPDATE media_gallery SET title=?, date=?, category=?, type=?, description=?';
    const values = [title, date, category, type, description];

    if (src) {
        sql += ', src=?';
        values.push(src);
    }
    if (poster) {
        sql += ', poster=?';
        values.push(poster);
    }
    if (youtubeUrl) {
        sql += ', youtube_url_original=?';
        values.push(youtubeUrl);
    }

    sql += ' WHERE id=?';
    values.push(idNum);

    db.query(sql, values, (err, result) => {
        if (err) return sendError(res, err);

        auditLogController.logActivity(req, 'UPDATE', 'Media', idNum, { title });
        res.json({ success: true, message: 'Media item updated successfully' });
    });
};

exports.deleteMediaItem = (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const query = 'DELETE FROM media_gallery WHERE id = ?';
    db.query(query, [idNum], (err, result) => {
        if (err) return sendError(res, err);
        auditLogController.logActivity(req, 'DELETE', 'Media', idNum);
        res.json({ success: true, message: 'Media item deleted successfully' });
    });
};
