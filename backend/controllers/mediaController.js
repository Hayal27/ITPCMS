const db = require('../models/db');
const auditLogController = require('./auditLogController');

exports.getMediaItems = (req, res) => {
    const query = 'SELECT * FROM media_gallery ORDER BY date DESC, created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching media items:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch media' });
        }
        const formatted = results.map(m => ({
            ...m,
            date: m.date ? m.date.toISOString().split('T')[0] : null
        }));
        res.json({ success: true, mediaItems: formatted });
    });
};

exports.addMediaItem = (req, res) => {
    const { title, date, category, type, description, youtubeUrl } = req.body;

    let poster = null;
    const mediaFileEntries = [];

    if (req.files && req.files.length > 0) {
        // Find general poster file if any
        const posterFile = req.files.find(f => f.fieldname === 'posterFile');
        if (posterFile) {
            poster = `/uploads/${posterFile.filename}`;
        }

        // Handle all media files (Batch Upload if multiple)
        const mediaFiles = req.files.filter(f => f.fieldname === 'mediaFiles');
        mediaFiles.forEach(f => {
            mediaFileEntries.push(`/uploads/${f.filename}`);
        });
    }

    // Fallback for YouTube video or manual src if no files
    if (mediaFileEntries.length === 0) {
        if (type === 'video' && youtubeUrl) {
            mediaFileEntries.push(youtubeUrl);
        } else if (req.body.src) {
            mediaFileEntries.push(req.body.src);
        }
    }

    if (mediaFileEntries.length === 0) {
        return res.status(400).json({ success: false, message: 'No media source provided (file or URL)' });
    }

    // Batch Insert logic
    const query = `
    INSERT INTO media_gallery (title, date, category, type, description, src, poster, youtube_url_original)
    VALUES ?
  `;

    const values = mediaFileEntries.map(src => [
        title, date, category, type, description, src, poster, youtubeUrl
    ]);

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error adding media item(s):', err);
            return res.status(500).json({ success: false, message: 'Failed to add media item(s)' });
        }

        auditLogController.logActivity(req, 'CREATE', 'Media', result.insertId, { title, count: mediaFileEntries.length });
        res.json({
            success: true,
            message: mediaFileEntries.length > 1 ? `${mediaFileEntries.length} items added successfully` : 'Media item added successfully',
            id: result.insertId
        });
    });
};

exports.updateMediaItem = (req, res) => {
    const { id } = req.params;
    const { title, date, category, type, description, youtubeUrl } = req.body;

    let src = req.body.src || null;
    let poster = req.body.poster || null;

    if (req.files && req.files.length > 0) {
        // If updating an image, take the first one from mediaFiles
        const mediaFile = req.files.find(f => f.fieldname === 'mediaFiles');
        if (mediaFile) {
            src = `/uploads/${mediaFile.filename}`;
        }

        const posterFile = req.files.find(f => f.fieldname === 'posterFile');
        if (posterFile) {
            poster = `/uploads/${posterFile.filename}`;
        }
    }

    let query = 'UPDATE media_gallery SET title=?, date=?, category=?, type=?, description=?';
    const values = [title, date, category, type, description];

    if (src) {
        query += ', src=?';
        values.push(src);
    }
    if (poster) {
        query += ', poster=?';
        values.push(poster);
    }
    if (youtubeUrl) {
        query += ', youtube_url_original=?';
        values.push(youtubeUrl);
    }

    query += ' WHERE id=?';
    values.push(id);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating media item:', err);
            return res.status(500).json({ success: false, message: 'Failed to update media item' });
        }

        auditLogController.logActivity(req, 'UPDATE', 'Media', id, { title });
        res.json({ success: true, message: 'Media item updated successfully' });
    });
};

exports.deleteMediaItem = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM media_gallery WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting media item:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete media item' });
        }

        auditLogController.logActivity(req, 'DELETE', 'Media', id);
        res.json({ success: true, message: 'Media item deleted successfully' });
    });
};
