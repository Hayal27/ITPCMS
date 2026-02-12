const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testPasswordReset() {
    console.log('\n🔍 DIAGNOSTIC TEST FOR PASSWORD RESET\n');

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'starteut_itp_cmsup',
        port: parseInt(process.env.DB_PORT || '3306', 10)
    });

    console.log('✅ Database connected\n');

    // Test 1: Check if redemption_token columns exist
    console.log('📋 Test 1: Checking database schema...');
    const [columns] = await connection.query(`
        SHOW COLUMNS FROM users WHERE Field IN ('reset_token', 'reset_token_expires', 'redemption_token', 'redemption_token_expires')
    `);

    console.log('Found columns:', columns.map(c => c.Field));

    if (columns.length < 4) {
        console.log('\n⚠️  MISSING COLUMNS! Running ALTER TABLE...\n');
        try {
            await connection.query(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS redemption_token VARCHAR(255) NULL,
                ADD COLUMN IF NOT EXISTS redemption_token_expires DATETIME NULL
            `);
            console.log('✅ Columns added successfully');
        } catch (e) {
            console.error('❌ Error adding columns:', e.message);
        }
    }

    // Test 2: Find a test user
    console.log('\n📋 Test 2: Finding test user...');
    const [users] = await connection.query(`
        SELECT u.user_id, u.user_name, u.password, e.email 
        FROM users u 
        LEFT JOIN employees e ON u.employee_id = e.employee_id 
        WHERE u.user_name = 'hayalt' OR e.email = 'onerrr@gmail.com'
        LIMIT 1
    `);

    if (users.length === 0) {
        console.log('❌ No test user found. Please provide a valid username or email.');
        await connection.end();
        return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.user_name} (ID: ${user.user_id})`);
    console.log(`   Email: ${user.email || 'NO EMAIL LINKED'}`);
    console.log(`   Current password hash: ${user.password.substring(0, 20)}...`);

    // Test 3: Simulate password reset
    console.log('\n📋 Test 3: Simulating password reset...');
    const testPassword = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    console.log(`   New password: ${testPassword}`);
    console.log(`   New hash: ${hashedPassword.substring(0, 20)}...`);

    const [updateResult] = await connection.query(`
        UPDATE users 
        SET password = ?,
            reset_token = NULL,
            reset_token_expires = NULL,
            redemption_token = NULL,
            redemption_token_expires = NULL,
            failed_login_attempts = 0,
            account_locked_until = NULL
        WHERE user_id = ?
    `, [hashedPassword, user.user_id]);

    console.log(`   Update result: AffectedRows=${updateResult.affectedRows}, ChangedRows=${updateResult.changedRows}`);

    // Test 4: Verify the update
    console.log('\n📋 Test 4: Verifying password was saved...');
    const [verifyUsers] = await connection.query('SELECT password FROM users WHERE user_id = ?', [user.user_id]);

    if (verifyUsers.length > 0) {
        const savedHash = verifyUsers[0].password;
        console.log(`   Saved hash: ${savedHash.substring(0, 20)}...`);
        console.log(`   Hashes match: ${savedHash === hashedPassword ? '✅ YES' : '❌ NO'}`);

        // Test password verification
        const passwordMatches = await bcrypt.compare(testPassword, savedHash);
        console.log(`   Password verification: ${passwordMatches ? '✅ PASS' : '❌ FAIL'}`);
    }

    // Test 5: Check email configuration
    console.log('\n📋 Test 5: Checking email configuration...');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ NOT SET'}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ SET (hidden)' : '❌ NOT SET'}`);

    // Test 6: Test email sending
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && user.email) {
        console.log('\n📋 Test 6: Testing email sending...');
        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        try {
            const testCode = '123456';
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'TEST: Password Reset Code',
                text: `This is a test email. Your code would be: ${testCode}`
            });
            console.log(`   ✅ Email sent successfully! MessageID: ${info.messageId}`);
        } catch (emailError) {
            console.error(`   ❌ Email failed:`, emailError.message);
            if (emailError.code === 'EAUTH') {
                console.log('\n   💡 TIP: Gmail requires an App Password, not your regular password.');
                console.log('   Generate one at: https://myaccount.google.com/apppasswords');
            }
        }
    } else {
        console.log('\n⚠️  Skipping email test (missing config or user email)');
    }

    console.log('\n✅ DIAGNOSTIC COMPLETE\n');
    console.log(`🔑 You can now try logging in with:`);
    console.log(`   Username: ${user.user_name}`);
    console.log(`   Password: ${testPassword}`);
    console.log('');

    await connection.end();
}

testPasswordReset().catch(console.error);
