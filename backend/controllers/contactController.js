const db = require('../models/db');
const { sendEmail } = require('../services/emailService');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Security Utility: Strip ALL HTML tags
const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).trim();
};

// Promisify database query
const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Submit contact form
exports.submitContactForm = async (req, res) => {
    let { name, email, phone, message, website } = req.body;

    // Honeypot check
    if (website) {
        console.warn(`[SECURITY] Bot detected in contact form from IP: ${req.ip}`);
        return res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully.'
        });
    }

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email and message'
        });
    }

    // Sanitize inputs
    name = cleanString(name);
    email = cleanString(email);
    phone = cleanString(phone);
    message = cleanString(message);

    try {
        // Save to database
        const result = await query(
            'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone, message]
        );

        // Send confirmation email to user
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">Message Received!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thank you for reaching out to Ethiopian IT Park. We have received your message and our team will get back to you as soon as possible.</p>
                <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #1a365d;">
                    <p style="margin: 0; font-style: italic;">"We have successfully received your inquiry and are reviewing it now."</p>
                </div>
                <p>Best regards,<br><strong>The Ethiopian IT Park Team</strong></p>
            </div>
        `;

        sendEmail({
            to: email,
            subject: 'We received your message!',
            html: html
        }).catch(err => console.error('Background Email Error:', err));

        return res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message.',
            error: error.message
        });
    }
};

// Get all messages (Admin)
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await query(
            'SELECT * FROM contact_messages ORDER BY created_at DESC'
        );
        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};

// ... (markAsRead and deleteMessage function unchanged) ...
exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await query(
            'UPDATE contact_messages SET status = ? WHERE id = ?',
            ['read', id]
        );
        res.status(200).json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update message status'
        });
    }
};

// Delete message (Admin)
exports.deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM contact_messages WHERE id = ?', [id]);
        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
};

// Reply to message (Admin)
exports.replyToMessage = async (req, res) => {
    const { id } = req.params;
    let { replyMessage, subject } = req.body;

    if (!replyMessage || !subject) {
        return res.status(400).json({
            success: false,
            message: 'Please provide subject and reply message'
        });
    }

    // Sanitize reply
    replyMessage = cleanString(replyMessage);
    subject = cleanString(subject);

    try {
        // Fetch message details
        const messages = await query('SELECT * FROM contact_messages WHERE id = ?', [id]);
        if (messages.length === 0) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        const msg = messages[0];

        // Send Email
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">Reply to your Inquiry</h2>
                <p>Hello <strong>${msg.name}</strong>,</p>
                <p>Thank you for contacting Ethiopian IT Park. Here is our response to your inquiry:</p>
                <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #1a365d; white-space: pre-wrap;">
                    ${replyMessage}
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">Original Message (received on ${new Date(msg.created_at).toLocaleDateString()}):</p>
                <p style="font-size: 12px; color: #666; font-style: italic;">${msg.message}</p>
                <p>Best regards,<br><strong>The Ethiopian IT Park Team</strong></p>
            </div>
        `;

        const emailResult = await sendEmail({
            to: msg.email,
            subject: subject,
            html: html
        });

        if (!emailResult.success) {
            throw new Error(emailResult.error || 'Failed to send email');
        }

        // Update status in database
        await query(
            'UPDATE contact_messages SET status = ? WHERE id = ?',
            ['replied', id]
        );

        res.status(200).json({
            success: true,
            message: 'Reply sent successfully and status updated.'
        });

    } catch (error) {
        console.error('Error replying to message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send reply',
            error: error.message
        });
    }
};
