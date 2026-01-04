
const con = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auditLogController = require('../controllers/auditLogController');
const nodemailer = require('nodemailer');

// Secret key (as specified in your requirements)
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'cms_default_jwt_secret_change_me'; // WARNING: Change in .env
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

// Email Transporter Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Helper to check if IP is blocked
const isIpBlocked = (ip) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM blocked_ips WHERE ip_address = ?", [ip], (err, results) => {
            if (err) reject(err);
            else resolve(results.length > 0 ? results[0] : null);
        });
    });
};

const blockIp = (ip, reason) => {
    con.query("INSERT IGNORE INTO blocked_ips (ip_address, reason, blocked_at) VALUES (?, ?, NOW())", [ip, reason], (err) => {
        if (err) console.error("Error blocking IP:", err);
        else console.log(`[SECURITY] IP Blocked: ${ip}, Reason: ${reason}`);
    });
};

const sendAccountLockedEmail = (email, username, lockUntil, resetToken) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Security Alert: ITPC-CMS Account Temporarily Suspended',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #d9534f; border-bottom: 2px solid #d9534f; padding-bottom: 10px;">Security Alert: Account Suspended</h2>
                <p>Hello <strong>${username}</strong>,</p>
                <p>Your account has been temporarily suspended due to <strong>${MAX_ATTEMPTS} failed login attempts</strong> from IP: ${resetToken.ip || 'Unknown'}.</p>
                <p>Account will remain locked until: <strong>${new Date(lockUntil).toLocaleString()}</strong></p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #0275d8;">
                    <h3 style="margin-top: 0; color: #0275d8;">Redeem Your Account</h3>
                    <p>Use the following verification code to unlock your account and reset your password:</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; color: #333; margin: 10px 0;">${resetToken.code}</p>
                </div>

                <p>If this was you, you can click the button below to go to the login page and use the "Forgot Password" feature with this code, or wait for the lockout to expire.</p>
                <p>If this was NOT you, please secure your account immediately.</p>
                
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                       style="background-color: #0275d8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                       Unlock Account Now
                    </a>
                </div>
                <p style="margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
                    This is an automated security notification for your ITPC-CMS account. Do not share your verification code with anyone.
                </p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Account locked email error:', error);
            console.log(`[MOCK EMAIL] Security alert to ${email} for user ${username}`);
        } else {
            console.log('Security alert email sent: ' + info.response);
        }
    });
};

// Function to handle login
const getLogin = async (req, res) => {
    const { user_name, pass } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!pass) return res.status(400).json({ success: false, message: 'Password is required' });

    try {
        // 1. Check IP Block
        const blockedParams = await isIpBlocked(ip);
        if (blockedParams) {
            return res.status(403).json({ success: false, message: 'Your IP address is temporarily blocked due to suspicious activity.', locked: true });
        }

        // 2. Fetch User
        const query = `
          SELECT u.*, e.*
          FROM users u 
          LEFT JOIN employees e ON u.employee_id = e.employee_id 
          WHERE u.user_name = ?
        `;

        const results = await new Promise((resolve, reject) => {
            con.query(query, [user_name], (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const user = results[0];

        // 3. Check Account Lock
        if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
            return res.status(403).json({
                success: false,
                message: `Account suspended until ${new Date(user.account_locked_until).toLocaleTimeString()}. Too many failed attempts.`,
                locked: true
            });
        }

        // 4. Verify Password
        let passwordMatch = false;
        if (user.password) {
            passwordMatch = await bcrypt.compare(pass, user.password);
        }

        if (passwordMatch && user.status === '1') {
            // Success: Reset attempts and lock
            con.query('UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL, online_flag = 1 WHERE user_id = ?', [user.user_id]);

            const token = jwt.sign({ user_id: user.user_id, role_id: user.role_id }, JWT_SECRET_KEY, { expiresIn: '400h' });

            auditLogController.logActivity(
                { ...req, session: { user: { id: user.user_id } }, ip },
                "LOGIN",
                "User",
                user.user_id,
                { username: user.user_name }
            );

            return res.status(200).json({ success: true, token, user });

        } else {
            // Failure: Increment attempts
            const newAttempts = (user.failed_login_attempts || 0) + 1;
            let updateSql = 'UPDATE users SET failed_login_attempts = ? WHERE user_id = ?';
            let params = [newAttempts, user.user_id];
            let msg = `Invalid username or password. attempt ${newAttempts} of ${MAX_ATTEMPTS}.`;

            if (newAttempts >= MAX_ATTEMPTS) {
                const lockUntil = new Date(Date.now() + LOCK_TIME_MS);
                const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
                const expires = new Date(Date.now() + 3600000); // 1 hour

                updateSql = 'UPDATE users SET failed_login_attempts = ?, account_locked_until = ?, reset_token = ?, reset_token_expires = ? WHERE user_id = ?';
                params = [newAttempts, lockUntil, resetToken, expires, user.user_id];

                // Block IP as well
                blockIp(ip, `Too many failed login attempts for user ${user_name}`);

                // Send security email
                const userEmail = results[0].email;
                if (userEmail) {
                    sendAccountLockedEmail(userEmail, user.user_name, lockUntil, { code: resetToken, ip });
                }

                con.query(updateSql, params);
                msg = "Account suspended due to multiple failed login attempts. A redemption code has been sent to your email.";
                return res.status(401).json({ success: false, message: msg, locked: true });
            }

            con.query(updateSql, params);

            auditLogController.logActivity(
                { ...req, session: { user: { id: null } }, ip },
                "LOGIN_FAILED",
                "User",
                null,
                { username: user_name, attempts: newAttempts }
            );

            return res.status(401).json({ success: false, message: msg });
        }

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Forgot Password
const forgotPassword = (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    email = email.trim().toLowerCase();

    console.log(`[FORGOT] Password reset requested for: ${email}`);

    const sql = `
        SELECT u.user_id, u.user_name, e.email 
        FROM users u 
        LEFT JOIN employees e ON u.employee_id = e.employee_id 
        WHERE e.email = ? OR u.user_name = ?
    `;

    con.query(sql, [email, email], (err, results) => {
        if (err || results.length === 0) {
            console.log(`[FORGOT] No user found for input: ${email}`);
            return res.status(200).json({ message: "If that account exists, a reset code has been sent." });
        }

        const user = results[0];
        const targetEmail = user.email || email; // Fallback if no employee linked

        if (!targetEmail || !targetEmail.includes('@')) {
            console.log(`[FORGOT] Cannot send email, no valid address for: ${user.user_name}`);
            return res.status(400).json({ message: "No email address linked to this account. Please contact administrator." });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
        const expires = new Date(Date.now() + 3600000); // 1 hour

        con.query("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?",
            [resetToken, expires, user.user_id],
            (updateErr) => {
                if (updateErr) return res.status(500).json({ message: "Error generating token" });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: targetEmail,
                    subject: 'ITPC-CMS Password Reset Code',
                    text: `Your password reset code is: ${resetToken}\n\nThis code was requested to reset your ITPC-CMS account password.`
                };

                // Try to send email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Email sending error:', error);
                    } else {
                        console.log(`[FORGOT] Reset email sent to ${targetEmail}`);
                    }
                });

                console.log(`[DEBUG EMAIL] To: ${targetEmail}, Code: ${resetToken}`);
                res.status(200).json({ message: "Reset code sent to your email." });
            }
        );
    });
};

const redeemAccount = async (req, res) => {
    let { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Missing identifier or code" });

    email = email.trim().toLowerCase();
    code = code.trim();

    console.log(`[REDEEM] Attempting unlock for ${email} with code ${code}`);

    const sql = `
        SELECT u.user_id, u.reset_token_expires, u.reset_token, u.user_name
        FROM users u 
        LEFT JOIN employees e ON u.employee_id = e.employee_id 
        WHERE e.email = ? OR u.user_name = ?
    `;

    con.query(sql, [email, email], async (err, results) => {
        if (err) {
            console.error("[REDEEM] DB Error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "Invalid email or username" });
        }

        const user = results[0];
        if (user.reset_token !== code) {
            return res.status(400).json({ message: "Invalid verification code." });
        }

        if (new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ message: "Code expired" });
        }

        const ip = req.ip || req.connection.remoteAddress;

        // Unlock only: reset attempts and lock until, clear token
        con.query("UPDATE users SET reset_token = NULL, reset_token_expires = NULL, failed_login_attempts = 0, account_locked_until = NULL WHERE user_id = ?",
            [user.user_id],
            (updErr) => {
                if (updErr) return res.status(500).json({ message: "Error unlocking account" });

                // Also unblock IP
                con.query("DELETE FROM blocked_ips WHERE ip_address = ?", [ip], (delErr) => {
                    if (delErr) console.error("Error unblocking IP on redeem:", delErr);
                });

                res.status(200).json({ message: "Account unlocked and IP unblocked. You can now log in with your current password." });
            }
        );
    });
};

// Reset Password
const resetPassword = async (req, res) => {
    let { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ message: "Missing fields" });

    email = email.trim().toLowerCase();
    code = code.trim();

    console.log(`[RESET] Attempting reset for ${email} with code ${code}`);

    const sql = `
        SELECT u.user_id, u.reset_token_expires, u.reset_token, u.user_name
        FROM users u 
        LEFT JOIN employees e ON u.employee_id = e.employee_id 
        WHERE e.email = ? OR u.user_name = ?
    `;

    con.query(sql, [email, email], async (err, results) => {
        if (err) {
            console.error("[RESET] DB Error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            console.log(`[RESET] No user found for input: ${email}`);
            return res.status(400).json({ message: "Invalid email or username" });
        }

        const user = results[0];
        console.log(`[RESET] Verification for ${user.user_name}. Expected: ${user.reset_token}, Received: ${code}`);

        if (user.reset_token !== code) {
            return res.status(400).json({ message: "Invalid verification code. Please check your email and try again." });
        }


        if (new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ message: "Code expired" });
        }

        try {
            const hashed = await bcrypt.hash(newPassword, 10);
            const ip = req.ip || req.connection.remoteAddress;

            con.query("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, failed_login_attempts = 0, account_locked_until = NULL WHERE user_id = ?",
                [hashed, user.user_id],
                (updErr) => {
                    if (updErr) return res.status(500).json({ message: "Error updating password" });

                    // Also unblock the current IP if it was blocked
                    con.query("DELETE FROM blocked_ips WHERE ip_address = ?", [ip], (delErr) => {
                        if (delErr) console.error("Error unblocking IP on reset:", delErr);
                    });

                    res.status(200).json({ message: "Password reset successfully. Account unlocked and IP unblocked." });
                }
            );
        } catch (e) {
            res.status(500).json({ message: "Server error" });
        }
    });
};

// Function to handle logout
const logout = (req, res) => {
    const id = req.params.user_id;

    // Update user's online_flag to 0 to indicate logout
    con.query('UPDATE users SET online_flag=? WHERE user_id=?', [0, id], (error, results) => {
        if (error) {
            console.error('Error updating logout status:', error);
            return res.status(500).send({ message: "Error updating logout status", error: error.message });
        } else {
            console.log('Logout status updated successfully', results);

            // Log logout activity
            auditLogController.logActivity(
                { ...req, session: { user: { id: id } }, ip: req.ip || req.connection.remoteAddress },
                "LOGOUT",
                "User",
                id
            );

            return res.status(200).send({ message: 'Logout successful' });
        }
    });
};

module.exports = { getLogin, logout, forgotPassword, resetPassword, redeemAccount };
