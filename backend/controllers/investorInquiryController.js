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

// Submit investor inquiry
exports.submitInquiry = async (req, res) => {
    const { fullName, email, organization, areaOfInterest } = req.body;

    if (!fullName || !email) {
        return res.status(400).json({
            success: false,
            message: 'Please provide at least Name and Email'
        });
    }

    try {
        // Save to database
        await query(
            'INSERT INTO investor_inquiries (full_name, email, organization, area_of_interest) VALUES (?, ?, ?, ?)',
            [fullName, email, organization, areaOfInterest]
        );

        // Send confirmation email to investor
        await sendConfirmationEmail(email, fullName);

        res.status(201).json({
            success: true,
            message: 'Your inquiry has been submitted successfully. Our executive team will contact you soon.'
        });
    } catch (error) {
        console.error('Investor inquiry error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit inquiry. Please try again later.'
        });
    }
};

// Get all inquiries (Admin)
exports.getAllInquiries = async (req, res) => {
    try {
        const inquiries = await query(
            'SELECT * FROM investor_inquiries ORDER BY created_at DESC'
        );
        res.status(200).json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inquiries'
        });
    }
};

const sendConfirmationEmail = async (email, name) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: `"Ethiopian IT Park Executive Office" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'IT Park Investor Briefing Request Received',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #0c7c92; margin-bottom: 24px;">Investment Inquiry Received</h2>
                    <p>Dear ${name},</p>
                    <p>Thank you for your interest in the Ethiopian IT Park. We have received your request for an executive briefing.</p>
                    <p>Our team is currently reviewing your inquiry and will be in touch with you shortly to provide the necessary documentation and schedule a detailed discussion.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #0c7c92;">
                        <p style="margin: 0; font-style: italic;">"Developing Africa's Premier Technology Hub"</p>
                    </div>
                    <p>Best regards,<br><strong>Executive Office</strong><br>Ethiopian IT Park Corporation</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                    <p style="font-size: 12px; color: #64748b;">This is an automated confirmation of your submission. No further action is required at this time.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending investor confirmation email:', error);
    }
};
