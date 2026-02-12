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
            if (item.image) {
                try {
                    // Try to parse if it's a JSON array
                    const parsed = JSON.parse(item.image);
                    item.image = Array.isArray(parsed) ? parsed : [item.image];
                } catch (e) {
                    // If parsing fails, treat as a single image string
                    item.image = [item.image];
                }
            } else {
                item.image = [];
            }

            if (item.tags) {
                try {
                    item.tags = JSON.parse(item.tags);
                } catch (e) {
                    item.tags = typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()) : [];
                }
            } else {
                item.tags = [];
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
        if (item.image) {
            try {
                const parsed = JSON.parse(item.image);
                item.image = Array.isArray(parsed) ? parsed : [item.image];
            } catch (e) {
                item.image = [item.image];
            }
        } else {
            item.image = [];
        }

        if (item.tags) {
            try {
                item.tags = JSON.parse(item.tags);
            } catch (e) {
                item.tags = typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()) : [];
            }
        } else {
            item.tags = [];
        }

        res.json({ success: true, news: item });
    });
};

// Create news
exports.createNews = (req, res) => {
    const { title, date, category, description, featured, readTime, tags, youtubeUrl, imageAltText } = req.body;
    let imagePaths = [];

    if (req.files && req.files.length > 0) {
        // Accept both 'imageFiles' and 'newsImages'
        const files = req.files.filter(f => f.fieldname === 'imageFiles' || f.fieldname === 'newsImages');
        imagePaths = files.map(file => `/uploads/${file.filename}`);
    }

    const query = `
    INSERT INTO news (title, date, category, image, description, featured, readTime, tags, youtubeUrl, imageAltText, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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

        // Notify Subscribers
        const subscriptionController = require('./subscriptionController');
        subscriptionController.notifySubscribers('news', {
            id: result.insertId,
            title,
            date,
            description
        }).catch(err => console.error('Notification Error:', err));

        res.status(201).json({ success: true, message: 'News created successfully', id: result.insertId });
    });
};

// Update news
exports.updateNews = (req, res) => {
    const { id } = req.params;
    const { title, date, category, description, featured, readTime, tags, youtubeUrl, imageAltText } = req.body;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
        // Support both 'imageFiles' and 'newsImages' (used in current frontend)
        const files = req.files.filter(f => f.fieldname === 'imageFiles' || f.fieldname === 'newsImages');
        imagePaths = files.map(file => `/uploads/${file.filename}`);
    }

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

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'News item not found' });
        }

        // Log Activity
        const auditLogController = require('./auditLogController');
        auditLogController.logActivity(req, 'UPDATE', 'News', id, { title });

        // Fetch the updated item to return it to the frontend
        const fetchQuery = 'SELECT * FROM news WHERE id = ?';
        db.query(fetchQuery, [id], (fetchErr, fetchResults) => {
            if (fetchErr || fetchResults.length === 0) {
                // Return success anyway, but without the object (fallback)
                return res.json({ success: true, message: 'News updated successfully' });
            }

            const item = fetchResults[0];
            try {
                item.image = JSON.parse(item.image);
            } catch (e) { }
            try {
                item.tags = JSON.parse(item.tags);
            } catch (e) { }

            res.json({ success: true, message: 'News updated successfully', ...item });
        });
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

// Get comments for a specific news item (Public - Approved only)
exports.getCommentsByPostId = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM comments WHERE news_item_id = ? AND approved = 1 ORDER BY created_at ASC';

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

// Get comments for a specific news item (Admin - All comments)
exports.getCommentsByPostIdAdmin = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM comments WHERE news_item_id = ? ORDER BY created_at ASC';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching admin comments:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch comments' });
        }

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
    const { name, email, text, parentId, website } = req.body;

    // Honeypot check
    if (website) {
        console.warn(`[SECURITY] Bot detected in comment form from IP: ${req.ip}`);
        return res.status(200).json({ success: true, message: 'Comment submitted for moderation' });
    }

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

// --- Admin Comment Moderation ---

// Get all comments for admin review
exports.getAllCommentsAdmin = (req, res) => {
    const query = `
        SELECT c.*, n.title as news_title 
        FROM comments c 
        LEFT JOIN news n ON c.news_item_id = n.id 
        ORDER BY c.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching all comments for admin:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch comments' });
        }
        res.json({ success: true, comments: results });
    });
};

// Approve a comment
exports.approveComment = (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE comments SET approved = 1 WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error approving comment:', err);
            return res.status(500).json({ success: false, message: 'Failed to approve comment' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Log Activity
        const auditLogController = require('./auditLogController');
        auditLogController.logActivity(req, 'APPROVE', 'Comment', id);

        res.json({ success: true, message: 'Comment approved successfully' });
    });
};

// Delete a comment
exports.deleteComment = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM comments WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting comment:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete comment' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Log Activity
        const auditLogController = require('./auditLogController');
        auditLogController.logActivity(req, 'DELETE', 'Comment', id);

        res.json({ success: true, message: 'Comment deleted successfully' });
    });
};
