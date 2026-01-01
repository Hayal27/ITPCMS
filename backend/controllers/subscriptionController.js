const db = require('../models/db');
const nodemailer = require('nodemailer');
const util = require('util');
require('dotenv').config();

// Promisify database query manually to ensure compatibility
const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

console.log("LOADED UPDATED SUBSCRIPTION CONTROLLER");

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

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
    const { email } = req.body;

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    try {
        // Check if email already exists
        const existing = await query(
            'SELECT * FROM subscribers WHERE email = ?',
            [email]
        );

        if (existing && existing.length > 0) {
            if (existing[0].status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already subscribed to our newsletter'
                });
            } else {
                // Reactivate subscription
                await query(
                    'UPDATE subscribers SET status = ?, unsubscribed_at = NULL WHERE email = ?',
                    ['active', email]
                );

                // Send welcome back email
                await sendWelcomeEmail(email, true);

                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! Your subscription has been reactivated.'
                });
            }
        }

        // Insert new subscriber
        await query(
            'INSERT INTO subscribers (email) VALUES (?)',
            [email]
        );

        // Send welcome email
        await sendWelcomeEmail(email, false);

        res.status(201).json({
            success: true,
            message: 'Thank you for subscribing! Check your email for confirmation.'
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again later.'
        });
    }
};

// Send welcome email
const sendWelcomeEmail = async (email, isReturning = false) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Ethiopian IT Park" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: isReturning ? 'Welcome Back to Ethiopian IT Park Newsletter!' : 'Welcome to Ethiopian IT Park Newsletter!',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16284F 0%, #0C7C92 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #16284F 0%, #0C7C92 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isReturning ? 'Welcome Back!' : 'Welcome to Our Newsletter!'}</h1>
            </div>
            <div class="content">
              <p>Dear Subscriber,</p>
              <p>${isReturning ?
                    'We\'re thrilled to have you back! You\'ve successfully reactivated your subscription to the Ethiopian IT Park newsletter.' :
                    'Thank you for subscribing to the Ethiopian IT Park newsletter! We\'re excited to have you join our community.'
                }</p>
              <p>You'll now receive:</p>
              <ul>
                <li>Latest news and updates from Ethiopian IT Park</li>
                <li>Upcoming events and opportunities</li>
                <li>Innovation insights and success stories</li>
                <li>Exclusive announcements and resources</li>
              </ul>
              <p>Stay connected with Ethiopia's leading digital hub!</p>
              <a href="${process.env.FRONTEND_URL || 'https://api-cms.startechaigroup.com3002'}" class="button">Visit Our Website</a>
            </div>
            <div class="footer">
              <p>Ethiopian IT Park | Goro Road to Tulu Dimtu, Addis Ababa, Ethiopia</p>
              <p>(c) ${new Date().getFullYear()} Ethiopian IT Park. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
        };
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', email);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

// Send notification to all subscribers
exports.notifySubscribers = async (type, item) => {
    try {
        const subscribers = await query(
            'SELECT email FROM subscribers WHERE status = ?',
            ['active']
        );

        if (!subscribers || subscribers.length === 0) {
            console.log('No active subscribers to notify');
            return;
        }

        const transporter = createTransporter();
        const isNews = type === 'news';
        const title = item.title;
        const date = item.date;
        const description = item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
        const link = `${process.env.FRONTEND_URL || 'https://api-cms.startechaigroup.com3002'}/${isNews ? 'news' : 'events'}/${item.id}`;

        for (const subscriber of subscribers) {
            const mailOptions = {
                from: `"Ethiopian IT Park" <${process.env.EMAIL_USER}>`,
                to: subscriber.email,
                subject: `New ${isNews ? 'News' : 'Event'}: ${title}`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #16284F 0%, #0C7C92 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .badge { display: inline-block; padding: 5px 15px; background: #0C7C92; color: white; border-radius: 20px; font-size: 12px; margin-bottom: 15px; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #16284F 0%, #0C7C92 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .unsubscribe { color: #999; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New ${isNews ? 'News' : 'Event'} from Ethiopian IT Park</h1>
              </div>
              <div class="content">
                <span class="badge">${isNews ? 'NEWS' : 'EVENT'}</span>
                <h2>${title}</h2>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p>${description}</p>
                <a href="${link}" class="button">Read More</a>
              </div>
              <div class="footer">
                <p>Ethiopian IT Park | Goro Road to Tulu Dimtu, Addis Ababa, Ethiopia</p>
                <p>(c) ${new Date().getFullYear()} Ethiopian IT Park. All rights reserved.</p>
                <p><a href="${process.env.FRONTEND_URL || 'https://api-cms.startechaigroup.com3002'}/unsubscribe?email=${subscriber.email}" class="unsubscribe">Unsubscribe</a></p>
              </div>
            </div>
          </body>
          </html>
        `
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Notification sent to: ${subscriber.email}`);
            } catch (error) {
                console.error(`Failed to send to ${subscriber.email}:`, error);
            }
        }

        console.log(`Notifications sent to ${subscribers.length} subscribers`);
    } catch (error) {
        console.error('Error notifying subscribers:', error);
    }
};

// Get all subscribers (admin only)
exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await query(
            'SELECT id, email, status, subscribed_at, unsubscribed_at FROM subscribers ORDER BY subscribed_at DESC'
        );

        res.status(200).json({
            success: true,
            count: subscribers.length,
            data: subscribers
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscribers'
        });
    }
};

// Unsubscribe
exports.unsubscribe = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await query(
            'UPDATE subscribers SET status = ?, unsubscribed_at = NOW() WHERE email = ? AND status = ?',
            ['unsubscribed', email, 'active']
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Email not found or already unsubscribed'
            });
        }

        res.status(200).json({
            success: true,
            message: 'You have been successfully unsubscribed'
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe'
        });
    }
};
