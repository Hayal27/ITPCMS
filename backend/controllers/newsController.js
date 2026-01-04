const db = require('../models/db');

// Get all news
exports.getAllNews = (req, res) => {
    const query = 'SELECT * FROM news ORDER BY date DESC, createdAt DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching news:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch news' });
        }

        // Parse JSON fields
        const formattedResults = results.map(item => {
            try {
                item.image = JSON.parse(item.image);
            } catch (e) {
                // keep as is if not valid json
            }
            try {
                item.tags = JSON.parse(item.tags);
            } catch (e) {
                // keep as is
            }
            return item;
        });

        res.json({ success: true, news: formattedResults });
    });
};

// Get single news by ID
exports.getNewsById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM news WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching news item:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch news item' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'News item not found' });
        }

        const item = results[0];
        try {
            item.image = JSON.parse(item.image);
        } catch (e) { }
        try {
            item.tags = JSON.parse(item.tags);
        } catch (e) { }

        res.json({ success: true, news: item });
    });
};

// Create news
exports.createNews = (req, res) => {
    const { title, date, category, description, featured, readTime, tags, youtubeUrl, imageAltText } = req.body;
    let imagePaths = [];

    if (req.files && req.files.length > 0) {
        const files = req.files.filter(f => f.fieldname === 'imageFiles');
        imagePaths = files.map(file => `/uploads/${file.filename}`);
    }

    const query = `
    INSERT INTO news (title, date, category, image, description, featured, readTime, tags, youtubeUrl, imageAltText)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const values = [
        title,
        date,
        category,
        JSON.stringify(imagePaths),
        description,
        featured === 'true' || featured === true ? 1 : 0,
        readTime,
        JSON.stringify(tags ? (Array.isArray(tags) ? tags : [tags]) : []),
        youtubeUrl,
        imageAltText
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating news:', err);
            return res.status(500).json({ success: false, message: 'Failed to create news' });
        }

        // Log Activity
        const auditLogController = require('./auditLogController');
        auditLogController.logActivity(req, 'CREATE', 'News', result.insertId, { title });

        res.status(201).json({ success: true, message: 'News created successfully', id: result.insertId });
    });
};

// Update news
exports.updateNews = (req, res) => {
    const { id } = req.params;
    const { title, date, category, description, featured, readTime, tags, youtubeUrl, imageAltText } = req.body;

    // Logic to handle images needs to be robust: keeping old ones, adding new ones, removing specific ones.
    // For simplicity here, assuming full replace or append logic would be handled by frontend sending current state.
    // In a basic implementation, if new files are uploaded, we might just use those. 
    // BETTER APPROACH: Frontend sends 'existingImages' array and we combine with new uploads.

    // For now, let's assuming if files are uploaded, we append them to existing or replace depending on logic.
    // Let's first fetch existing to merge if needed, but let's stick to a simpler "update what's passed" approach for now.

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
        const files = req.files.filter(f => f.fieldname === 'imageFiles');
        imagePaths = files.map(file => `/uploads/${file.filename}`);
    }

    // Construct update query dynamically or fixed if we assume all fields are present
    // Simplified fixed query for core fields
    let query = `
    UPDATE news 
    SET title=?, date=?, category=?, description=?, featured=?, readTime=?, tags=?, youtubeUrl=?, imageAltText=?
  `;
    const values = [
        title,
        date,
        category,
        description,
        featured === 'true' || featured === true ? 1 : 0,
        readTime,
        JSON.stringify(tags ? (Array.isArray(tags) ? tags : [tags]) : []),
        youtubeUrl,
        imageAltText
    ];

    if (imagePaths.length > 0) {
        query += `, image=?`;
        values.push(JSON.stringify(imagePaths));
    }

    query += ` WHERE id=?`;
    values.push(id);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating news:', err);
            return res.status(500).json({ success: false, message: 'Failed to update news' });
        }

        // Log Activity
        const auditLogController = require('./auditLogController');
        auditLogController.logActivity(req, 'UPDATE', 'News', id, { title });

        res.json({ success: true, message: 'News updated successfully' });
    });
};

// Delete news
exports.deleteNews = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM news WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting news:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete news' });
        }

        // Log Activity
        const auditLogController = require('./auditLogController');
        auditLogController.logActivity(req, 'DELETE', 'News', id);

        res.json({ success: true, message: 'News deleted successfully' });
    });
};

// --- Comments Logic ---

// Get comments for a specific news item
exports.getCommentsByPostId = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM comments WHERE news_item_id = ? ORDER BY created_at ASC';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch comments' });
        }

        // Helper function to build nested comments (replies)
        const formatComments = (comments) => {
            const map = {};
            const roots = [];

            comments.forEach(c => {
                map[c.id] = {
                    ...c,
                    date: c.created_at,
                    replies: []
                };
            });

            comments.forEach(c => {
                if (c.parent_id && map[c.parent_id]) {
                    map[c.parent_id].replies.push(map[c.id]);
                } else {
                    roots.push(map[c.id]);
                }
            });

            return roots;
        };

        const nestedComments = formatComments(results);
        res.json({ success: true, comments: nestedComments });
    });
};

// Post a new comment or reply
exports.postComment = (req, res) => {
    const { id } = req.params; // news_item_id
    const { name, email, text, parentId } = req.body;

    if (!name || !email || !text) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const query = `
    INSERT INTO comments (news_item_id, name, email, text, parent_id)
    VALUES (?, ?, ?, ?, ?)
  `;
    const values = [id, name, email, text, parentId || null];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error posting comment:', err);
            return res.status(500).json({ success: false, message: 'Failed to post comment' });
        }

        const newComment = {
            id: result.insertId,
            news_item_id: id,
            name,
            email,
            text,
            parent_id: parentId || null,
            created_at: new Date(),
            approved: 0,
            replies: []
        };

        res.status(201).json({ success: true, message: 'Comment posted successfully. Awaiting approval.', comment: newComment });
    });
};
