const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkCurrentPassword() {
    console.log('\n🔍 CHECKING CURRENT DATABASE STATE\n');

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'starteut_itp_cmsup',
        port: parseInt(process.env.DB_PORT || '3306', 10)
    });

    console.log('✅ Connected to database\n');

    // Get the user you're trying to reset
    console.log('Enter the username or email you are trying to reset:');
    const username = process.argv[2] || 'hayalt';

    const [users] = await connection.query(`
        SELECT u.user_id, u.user_name, u.password, u.reset_token, u.reset_token_expires,
               u.redemption_token, u.redemption_token_expires, u.failed_login_attempts,
               u.account_locked_until, e.email
        FROM users u 
        LEFT JOIN employees e ON u.employee_id = e.employee_id 
        WHERE u.user_name = ? OR e.email = ?
        LIMIT 1
    `, [username, username]);

    if (users.length === 0) {
        console.log(`❌ User not found: ${username}`);
        await connection.end();
        return;
    }

    const user = users[0];
    console.log('📋 USER INFORMATION:');
    console.log(`   User ID: ${user.user_id}`);
    console.log(`   Username: ${user.user_name}`);
    console.log(`   Email: ${user.email || 'NO EMAIL'}`);
    console.log(`   Password Hash: ${user.password}`);
    console.log(`   Hash Type: ${user.password.startsWith('$2a$') ? 'bcrypt ($2a)' : user.password.startsWith('$2b$') ? 'bcrypt ($2b)' : 'UNKNOWN'}`);
    console.log(`\n🔐 SECURITY STATUS:`);
    console.log(`   Failed Login Attempts: ${user.failed_login_attempts || 0}`);
    console.log(`   Account Locked Until: ${user.account_locked_until || 'NOT LOCKED'}`);
    console.log(`   Reset Token: ${user.reset_token || 'NONE'}`);
    console.log(`   Reset Token Expires: ${user.reset_token_expires || 'N/A'}`);
    console.log(`   Redemption Token: ${user.redemption_token || 'NONE'}`);
    console.log(`   Redemption Expires: ${user.redemption_token_expires || 'N/A'}`);

    // Test password verification
    console.log(`\n🧪 PASSWORD TESTING:`);

    const testPasswords = [
        'TestPassword123!',
        'hayalt',
        'password',
        '123456',
        'admin'
    ];

    for (const testPwd of testPasswords) {
        try {
            const matches = await bcrypt.compare(testPwd, user.password);
            if (matches) {
                console.log(`   ✅ MATCH FOUND: "${testPwd}"`);
            }
        } catch (e) {
            // Silent fail
        }
    }

    console.log(`\n💡 To test a specific password, run:`);
    console.log(`   node check_password.js ${username} YourPasswordHere`);

    if (process.argv[3]) {
        const testPassword = process.argv[3];
        console.log(`\n🔑 Testing password: "${testPassword}"`);
        try {
            const matches = await bcrypt.compare(testPassword, user.password);
            console.log(`   Result: ${matches ? '✅ CORRECT PASSWORD' : '❌ WRONG PASSWORD'}`);
        } catch (e) {
            console.log(`   ❌ Error testing password: ${e.message}`);
        }
    }

    await connection.end();
}

checkCurrentPassword().catch(console.error);
