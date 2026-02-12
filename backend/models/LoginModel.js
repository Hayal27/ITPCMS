
const con = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auditLogController = require('../controllers/auditLogController');
const { sendEmail } = require('../services/emailService');

// Secret key (as specified in your requirements)
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'cms_default_jwt_secret_change_me'; // WARNING: Change in .env
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

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

const sendSecurityEmail = (email, username, code, type, lockUntil = null, ip = 'Unknown') => {
    const isRedemption = type === 'redemption';
    const subject = isRedemption
        ? 'Security Alert: ITPC-CMS Account Temporarily Suspended'
        : 'ITPC-CMS Password Reset Code';

    const title = isRedemption ? 'Account Suspended' : 'Password Reset Request';
    const color = isRedemption ? '#d9534f' : '#1a365d';
    const actionText = isRedemption ? 'unlock your account' : 'reset your password';

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 10px;">${title}</h2>
            <p>Hello <strong>${username}</strong>,</p>
            
            ${isRedemption ? `
                <p>Your account has been temporarily suspended due to <strong>${MAX_ATTEMPTS} failed login attempts</strong> from IP: ${ip}.</p>
                <p>To protect your account, we have temporarily blocked this IP address from further attempts.</p>
            ` : `
                <p>We received a request to reset the password for your ITPC-CMS account.</p>
            `}
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0; text-align: center;">
                <h3 style="margin-top: 0; color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</h3>
                <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: ${color}; margin: 15px 0;">${code}</p>
                <p style="font-size: 13px; color: #718096; margin-bottom: 0;">Use this code to ${actionText}.</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
                <a href="${'https://admin.ethiopianitpark.et'}/login" 
                   style="background-color: ${color}; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
                   Go to Login Page
                </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 11px; color: #9a9a9a; border-top: 1px solid #eee; padding-top: 15px;">
                ${isRedemption && lockUntil ? `Account will remain locked until: <strong>${new Date(lockUntil).toLocaleString()}</strong> unless redeemed earlier.<br>` : ''}
                If you did not request this, please ignore this email or contact security if you believe this is an error.
                <br>This is an automated security notification for your ITPC-CMS account.
            </p>
        </div>
    `;

    const textContent = `${subject}\n\nHello ${username},\n\nYour verification code is: ${code}\n\nUse this to ${actionText}.`;

    return sendEmail({
        to: email,
        subject: subject,
        html: htmlContent,
        text: textContent
    }).catch(err => {
        console.error(`[SECURITY EMAIL ERROR] ${type}:`, err);
        return { success: false, error: err.message };
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
        // 2. Fetch User (Allow username OR linked employee email)
        const query = `
          SELECT u.*, e.*, r.role_name
          FROM users u 
          LEFT JOIN employees e ON u.employee_id = e.employee_id 
          LEFT JOIN roles r ON u.role_id = r.role_id
          WHERE u.user_name = ? OR e.email = ?
        `;

        const results = await new Promise((resolve, reject) => {
            con.query(query, [user_name, user_name], (err, queryResults) => {
                if (err) reject(err);
                else resolve(queryResults);
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
            console.log(`[LOGIN] Verifying user ${user.user_id} (${user.user_name})`);

            // Check password hash format
            if (!user.password.startsWith('$2')) {
                console.warn(`[LOGIN] User ${user.user_id} has non-standard password hash format (Legacy?)`);
            }

            try {
                passwordMatch = await bcrypt.compare(pass, user.password);
                console.log(`[LOGIN] Hashed password comparison result: ${passwordMatch}`);
            } catch (bcryptError) {
                console.error(`[LOGIN] Bcrypt comparison error for user ${user.user_id}:`, bcryptError);
                return res.status(500).json({ success: false, message: 'Encryption verification failed' });
            }
        } else {
            console.error(`[LOGIN] Critical: User ${user.user_id} has no password in database.`);
        }

        if (passwordMatch && String(user.status) === '1') {
            // Success: Reset attempts and lock
            con.query('UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL, online_flag = 1 WHERE user_id = ?', [user.user_id], (err) => {
                if (err) console.error("Error updating online_flag:", err);
            });

            const token = jwt.sign({
                user_id: user.user_id,
                role_id: user.role_id,
                initial_login: Date.now()
            }, JWT_SECRET_KEY, { expiresIn: '30m' });

            auditLogController.logActivity(
                { ...req, session: { user: { id: user.user_id } }, ip },
                "LOGIN",
                "User",
                user.user_id,
                { username: user.user_name }
            );

            // Set HttpOnly cookie with 30m inactivity timeout
            const isProd = process.env.NODE_ENV === 'production';
            console.log(`[AUTH] Setting login cookie. Production Mode: ${isProd}`);

            res.cookie('token', token, {
                httpOnly: true,
                secure: true, // MUST be true for SameSite: 'none' to work in Chrome
                sameSite: 'none', // Needed for cross-subdomain (admin to api)
                maxAge: 30 * 60 * 1000 // 30 minutes
            });

            // Filter sensitive data from user object
            const { password, reset_token, reset_token_expires, redemption_token, redemption_token_expires, ...safeUser } = user;

            return res.status(200).json({ success: true, user: safeUser });

        } else {
            // Failure: Increment attempts
            const newAttempts = (user.failed_login_attempts || 0) + 1;
            let updateSql = 'UPDATE users SET failed_login_attempts = ? WHERE user_id = ?';
            let params = [newAttempts, user.user_id];
            let msg = `Invalid username or password. attempt ${newAttempts} of ${MAX_ATTEMPTS}.`;

            if (newAttempts >= MAX_ATTEMPTS) {
                const lockUntil = new Date(Date.now() + LOCK_TIME_MS);
                const redemptionToken = Math.floor(100000 + Math.random() * 900000).toString();
                const expires = new Date(Date.now() + 3600000); // 1 hour

                updateSql = 'UPDATE users SET failed_login_attempts = ?, account_locked_until = ?, redemption_token = ?, redemption_token_expires = ? WHERE user_id = ?';
                params = [newAttempts, lockUntil, redemptionToken, expires, user.user_id];

                // Block IP as well
                blockIp(ip, `Too many failed login attempts for user ${user_name}`);

                // Send security email
                const userEmail = results[0].email || (user_name.includes('@') ? user_name : null);
                if (userEmail) {
                    sendSecurityEmail(userEmail, user.user_name, redemptionToken, 'redemption', lockUntil, ip);
                }

                con.query(updateSql, params, (err) => {
                    if (err) console.error("Error updating lock status:", err);
                });
                msg = "Account suspended due to multiple failed login attempts. A redemption code has been sent to your email.";
                return res.status(401).json({ success: false, message: msg, locked: true });
            }

            con.query(updateSql, params, (err) => {
                if (err) console.error("Error updating attempts:", err);
            });


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
const forgotPassword = async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email or username is required" });
    email = email.trim().toLowerCase();

    console.log(`[FORGOT] Requested for: ${email}`);

    try {
        const sql = `
            SELECT u.user_id, u.user_name, e.email 
            FROM users u 
            LEFT JOIN employees e ON u.employee_id = e.employee_id 
            WHERE e.email = ? OR u.user_name = ?
        `;

        const results = await new Promise((resolve, reject) => {
            con.query(sql, [email, email], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (results.length === 0) {
            console.log(`[FORGOT] No user found for: ${email}`);
            return res.status(200).json({ message: "If that account exists, a reset code has been sent." });
        }

        const user = results[0];
        const targetEmail = user.email || (email.includes('@') ? email : null);

        if (!targetEmail) {
            console.log(`[FORGOT] User ${user.user_name} found but no valid email linked.`);
            return res.status(400).json({ message: "No email address linked to this account. Please contact administrator." });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await new Promise((resolve, reject) => {
            con.query("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?",
                [resetToken, expires, user.user_id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        if (targetEmail) {
            const emailResult = await sendSecurityEmail(targetEmail, user.user_name, resetToken, 'reset');
            if (emailResult && !emailResult.success) {
                console.error(`[FORGOT] Email failed for ${user.user_name}:`, emailResult.error);
                return res.status(500).json({ message: `Code generated, but email failed: ${emailResult.error}` });
            }
        }

        // Diagnostic: Show partial email to help user verify target
        const maskedEmail = targetEmail.includes('@')
            ? `***${targetEmail.split('@')[0].slice(-3)}@${targetEmail.split('@')[1]}`
            : 'linked email';

        console.log(`[FORGOT] SUCCESS for ${user.user_name}. To: ${targetEmail}, Code: ${resetToken}`);
        return res.status(200).json({
            message: `Reset code sent to ${maskedEmail}. Please check your inbox and SPAM folder.`
        });

    } catch (error) {
        console.error('[FORGOT] Fatal Error:', error);
        return res.status(500).json({
            message: "Internal server error during forgot password",
            error: error.message || error
        });
    }
};

const redeemAccount = async (req, res) => {
    let { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Missing identifier or code" });

    email = email.trim().toLowerCase();
    code = code.trim();

    console.log(`[REDEEM] Attempting account unlock for: ${email}`);

    try {
        const sql = `
            SELECT u.user_id, u.redemption_token_expires, u.redemption_token, u.user_name, u.account_locked_until
            FROM users u 
            LEFT JOIN employees e ON u.employee_id = e.employee_id 
            WHERE e.email = ? OR u.user_name = ?
        `;

        const [results] = await con.promise().query(sql, [email, email]);

        if (results.length === 0) {
            return res.status(400).json({ message: "Account not found." });
        }

        const user = results[0];
        console.log(`[REDEEM] Verifying user ${user.user_id}. RedemptionToken: ${user.redemption_token}`);

        if (!user.redemption_token || user.redemption_token !== code) {
            console.warn(`[REDEEM] Invalid code provided for user ${user.user_id}`);
            return res.status(400).json({ message: "Invalid verification code for account unlocking." });
        }

        if (new Date(user.redemption_token_expires) < new Date()) {
            console.warn(`[REDEEM] Code ${code} expired for user ${user.user_id}`);
            return res.status(400).json({ message: "Redemption code has expired." });
        }

        const ip = req.ip || req.connection.remoteAddress;

        // Unlock strictly restores account, deletes block, but DOES NOT change password
        const updateSql = "UPDATE users SET redemption_token = NULL, redemption_token_expires = NULL, reset_token = NULL, reset_token_expires = NULL, failed_login_attempts = 0, account_locked_until = NULL WHERE user_id = ?";
        const [updateResult] = await con.promise().query(updateSql, [user.user_id]);

        console.log(`[REDEEM] Unlock DB result: AffectedRows=${updateResult.affectedRows}`);

        // Also unblock IP
        con.query("DELETE FROM blocked_ips WHERE ip_address = ?", [ip], (delErr) => {
            if (delErr) console.error("[REDEEM] IP unblock error:", delErr);
            else console.log(`[REDEEM] IP ${ip} unblocked.`);
        });

        res.status(200).json({ message: "Security unlock successful. Your account is now active. You can log in with your existing password." });

    } catch (e) {
        console.error("[REDEEM] Fatal error:", e);
        res.status(500).json({ message: "Internal server error during account redemption." });
    }
};

const resetPassword = async (req, res) => {
    let { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
        return res.status(400).json({ message: "Missing required fields: email/username, code, and new password." });
    }

    // Strong password policy check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            message: "New password does not meet security requirements. It must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters (@$!%*?&)."
        });
    }

    email = email.trim().toLowerCase();
    code = code.trim();

    console.log(`[RESET] Attempting password change for: ${email} with code: ${code}`);

    try {
        const sql = `
            SELECT u.user_id, u.reset_token_expires, u.reset_token, u.user_name
            FROM users u 
            LEFT JOIN employees e ON u.employee_id = e.employee_id 
            WHERE e.email = ? OR u.user_name = ?
        `;

        const [results] = await con.promise().query(sql, [email, email]);

        if (results.length === 0) {
            console.error(`[RESET] No user profile found for identifier: ${email}`);
            return res.status(400).json({ message: "Invalid email or username. Account not found." });
        }

        const user = results[0];
        console.log(`[RESET] Target user identified: ID=${user.user_id}, Name=${user.user_name}`);
        console.log(`[RESET] Token Check: DB='${user.reset_token}', UserProvided='${code}'`);

        if (!user.reset_token || user.reset_token !== code) {
            console.warn(`[RESET] Token Mismatch for user ${user.user_id}`);
            return res.status(400).json({ message: "Invalid verification code. Please request a new one." });
        }

        const now = new Date();
        const expiry = new Date(user.reset_token_expires);
        if (expiry < now) {
            console.warn(`[RESET] Token Expired for user ${user.user_id}. Expired at: ${user.reset_token_expires}`);
            return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
        }

        // Hash new password
        console.log(`[RESET] Hashing new password for user ${user.user_id}...`);
        const saltRounds = 10;
        const hashed = await bcrypt.hash(newPassword, saltRounds);
        const ip = req.ip || req.connection.remoteAddress;

        console.log(`[RESET] Executing database update for user ${user.user_id}...`);

        const updateSql = `
            UPDATE users 
            SET password = ?, 
                reset_token = NULL, 
                reset_token_expires = NULL,
                redemption_token = NULL,
                redemption_token_expires = NULL,
                failed_login_attempts = 0, 
                account_locked_until = NULL 
            WHERE user_id = ?
        `;

        const [updateResult] = await con.promise().query(updateSql, [hashed, user.user_id]);

        console.log(`[RESET] DB Result: AffectedRows=${updateResult.affectedRows}, ChangedRows=${updateResult.changedRows}`);

        if (updateResult.affectedRows === 0) {
            console.error(`[RESET] Update failed: user_id ${user.user_id} not found during update!`);
            return res.status(500).json({ message: "Failed to update database record. Please try again." });
        }

        // Also unblock IP on success
        await con.promise().query("DELETE FROM blocked_ips WHERE ip_address = ?", [ip]).catch(e => {
            console.error("[RESET] Optional IP unblock failed:", e.message);
        });

        console.log(`[RESET] SUCCESS: Password persisted for ${user.user_name}`);
        return res.status(200).json({ message: "Password successfully changed. You can now log in with your new password." });

    } catch (error) {
        console.error('[RESET] Fatal operational error:', error);
        return res.status(500).json({
            message: "System encountered an error while updating your password.",
            error: error.message
        });
    }
};

// Function to handle logout
const logout = (req, res) => {
    const id = req.params.user_id;
    const token = req.token || req.cookies?.token;

    // 1. Update user's online_flag to 0
    con.query('UPDATE users SET online_flag=? WHERE user_id=?', [0, id], (error, results) => {
        if (error) {
            console.error('Error updating logout status:', error);
            // Continue with token revocation even if flag update fails
        }

        // 2. Revoke the token if present
        if (token) {
            // Set expiration to 4 hours from now (matching absolute session limit)
            const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

            con.query('INSERT IGNORE INTO revoked_tokens (token, expires_at) VALUES (?, ?)', [token, expiresAt], (revokeErr) => {
                if (revokeErr) {
                    console.error('Error revoking token:', revokeErr);
                } else {
                    console.log(`[SECURITY] Token revoked for user ${id}`);
                }
            });
        }

        // 3. Audit logout activity
        auditLogController.logActivity(
            { ...req, session: { user: { id: id } }, ip: req.ip || req.connection.remoteAddress },
            "LOGOUT",
            "User",
            id
        );

        // 4. Clear the auth cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        return res.status(200).send({ message: 'Logout successful' });
    });
};

// Resend Redemption Code (for locked accounts)
const resendRedemptionCode = async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email or username is required" });
    email = email.trim().toLowerCase();

    console.log(`[REDEEM] Resend requested for: ${email}`);

    try {
        const sql = `
            SELECT u.user_id, u.user_name, e.email, u.account_locked_until 
            FROM users u 
            LEFT JOIN employees e ON u.employee_id = e.employee_id 
            WHERE e.email = ? OR u.user_name = ?
        `;

        const results = await new Promise((resolve, reject) => {
            con.query(sql, [email, email], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (results.length === 0) {
            return res.status(200).json({ message: "If that account is locked, a new code has been sent." });
        }

        const user = results[0];
        const isLocked = user.account_locked_until && new Date(user.account_locked_until) > new Date();

        if (!isLocked) {
            return res.status(400).json({ message: "This account is not currently locked. Please use the Forgot Password option if you need to reset your password." });
        }

        const redemptionToken = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await new Promise((resolve, reject) => {
            con.query("UPDATE users SET redemption_token = ?, redemption_token_expires = ? WHERE user_id = ?",
                [redemptionToken, expires, user.user_id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        const targetEmail = user.email || (email.includes('@') ? email : null);
        if (targetEmail) {
            sendSecurityEmail(targetEmail, user.user_name, redemptionToken, 'redemption', user.account_locked_until, req.ip);
        }

        console.log(`[REDEEM] SUCCESS resend for ${user.user_name}. Code: ${redemptionToken}`);
        return res.status(200).json({ message: "A new redemption code has been sent to your email." });

    } catch (error) {
        console.error('[REDEEM] Resend Error:', error);
        return res.status(500).json({ message: "Error resending redemption code", error: error.message });
    }
};

const changePassword = async (req, res) => {
    // Priority: use the ID from the verified token for maximum security
    const userId = req.user_id || req.body.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Complete all fields to proceed." });
    }

    // Strong password policy check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            message: "New password does not meet security requirements. It must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters (@$!%*?&)."
        });
    }

    try {
        // 1. Fetch detailed user profile
        const [results] = await con.promise().query("SELECT * FROM users WHERE user_id = ?", [userId]);

        if (results.length === 0) {
            console.warn(`[PASSWORD_CHANGE] Failed: User ID ${userId} not found.`);
            return res.status(404).json({ message: "User account not identified." });
        }

        const user = results[0];

        // 2. Verify the sanctity of the current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.warn(`[PASSWORD_CHANGE] Unauthorized attempt for ${user.user_name}: Incorrect current password.`);
            return res.status(401).json({ message: "The current password provided is incorrect." });
        }

        // 3. Encrypt the fresh credentials
        const saltRounds = 10;
        const hashed = await bcrypt.hash(newPassword, saltRounds);

        // 4. Persist the change and reset security state
        const updateSql = `
            UPDATE users 
            SET password = ?, 
                reset_token = NULL, 
                reset_token_expires = NULL,
                redemption_token = NULL, 
                redemption_token_expires = NULL,
                failed_login_attempts = 0,
                account_locked_until = NULL
            WHERE user_id = ?
        `;

        const [updateResult] = await con.promise().query(updateSql, [hashed, userId]);

        if (updateResult.affectedRows === 0) {
            throw new Error("Target user record vanished during update cycle.");
        }

        // 5. Audit the event
        auditLogController.logActivity(
            { ...req, session: { user: { id: userId } }, ip: req.ip || req.connection.remoteAddress },
            "CHANGE_PASSWORD",
            "User",
            userId,
            { username: user.user_name, status: "SUCCESS" }
        );

        console.log(`[PASSWORD_CHANGE] SUCCESS for user ${user.user_name} (ID: ${userId})`);
        return res.status(200).json({ success: true, message: "Your password has been securely updated." });

    } catch (error) {
        console.error('[PASSWORD_CHANGE] Fatal dynamic error:', error);
        return res.status(500).json({
            message: "A system error occurred while updating your password. Please contact support.",
            error: error.message
        });
    }
};

const getCurrentUser = async (req, res) => {
    const userId = req.user_id;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    try {
        const query = `
          SELECT u.user_id, u.user_name, u.role_id, u.status, u.online_flag,
                 e.fname, e.lname, e.email, e.employee_id,
                 r.role_name
          FROM users u 
          LEFT JOIN employees e ON u.employee_id = e.employee_id 
          LEFT JOIN roles r ON u.role_id = r.role_id
          WHERE u.user_id = ?
        `;

        const [results] = await con.promise().query(query, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const user = results[0];
        // Compose name for frontend compatibility
        user.name = user.fname;

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('[AUTH ERROR] getCurrentUser failure:', {
            error: error.message,
            userId: userId,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication check",
            debug: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
    }
};

module.exports = { getLogin, logout, forgotPassword, resetPassword, redeemAccount, resendRedemptionCode, changePassword, getCurrentUser };
