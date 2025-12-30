const db = require('../models/db');

// Manual promise wrapper
const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Get all FAQs
exports.getFAQs = async (req, res) => {
    try {
        const faqs = await query('SELECT * FROM faqs ORDER BY `order` ASC, created_at DESC');
        res.status(200).json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
    }
};

// Create a new FAQ
exports.createFAQ = async (req, res) => {
    try {
        const { question, answer, category, order } = req.body;
        if (!question || !answer || !category) {
            return res.status(400).json({ message: 'Please provide question, answer, and category' });
        }

        const result = await query(
            'INSERT INTO faqs (question, answer, category, `order`) VALUES (?, ?, ?, ?)',
            [question, answer, category, order || 0]
        );

        const newFAQ = { id: result.insertId, question, answer, category, order: order || 0 };
        res.status(201).json({ message: 'FAQ created successfully', faq: newFAQ });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({ message: 'Error creating FAQ', error: error.message });
    }
};

// Update an FAQ
exports.updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, category, order } = req.body;

        await query(
            'UPDATE faqs SET question = ?, answer = ?, category = ?, `order` = ? WHERE id = ?',
            [question, answer, category, order, id]
        );

        res.status(200).json({ message: 'FAQ updated successfully' });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        res.status(500).json({ message: 'Error updating FAQ', error: error.message });
    }
};

// Delete an FAQ
exports.deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM faqs WHERE id = ?', [id]);
        res.status(200).json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ message: 'Error deleting FAQ', error: error.message });
    }
};
