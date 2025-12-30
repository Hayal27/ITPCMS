const db = require('../models/db');
const nodemailer = require('nodemailer');

// Promisify database query
const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Submit contact form
exports.submitContactForm = async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email and message'
        });
    }

    try {
        // Save to database
        const result = await query(
            'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone, message]
        );

        // Send confirmation email to user
        await sendConfirmationEmail(email, name);

        // Notify admin (optional, can be added later)

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon.'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
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

// Mark message as read (Admin)
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

const sendConfirmationEmail = async (email, name) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: `"Ethiopian IT Park Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'We received your message!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #16284F;">Hello ${name},</h2>
                    <p>Thank you for reaching out to Ethiopian IT Park. We have received your message and our team will get back to you as soon as possible.</p>
                    <p>Here is a copy of your request:</p>
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Message received!</strong></p>
                    </div>
                    <p>Best regards,<br>The Ethiopian IT Park Team</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to:', email);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};
