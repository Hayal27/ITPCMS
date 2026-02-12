const mysql = require('mysql2/promise');
const axios = require('axios');
const bcrypt = require('bcryptjs');

async function fullPasswordResetTest() {
    console.log('\n🔥 FULL PASSWORD RESET TEST\n');

    const API_URL = 'https://api.ethiopianitpark.et';
    const username = 'hayalt';
    const newPassword = 'TestReset123!';

    // Connect to database
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'starteut_itp_cmsup',
        port: 3306
    });

    console.log('✅ Connected to database\n');

    // Step 1: Get current password hash
    console.log('📋 Step 1: Checking current state...');
    let [users] = await db.query(`
        SELECT u.user_id, u.user_name, u.password, e.email
        FROM users u 
        LEFT JOIN employees e ON u.employee_id = e.employee_id 
        WHERE u.user_name = ?
    `, [username]);

    const oldHash = users[0].password;
    console.log(`   Current hash: ${oldHash.substring(0, 30)}...`);

    // Step 2: Request reset code via API
    console.log('\n📧 Step 2: Requesting reset code via API...');
    try {
        const forgotResp = await axios.post(`${API_URL}/forgot-password`, {
            email: username
        });
        console.log(`   API Response: ${forgotResp.data.message}`);
    } catch (e) {
        console.error(`   ❌ API Error:`, e.response?.data || e.message);
        await db.end();
        return;
    }

    // Step 3: Get the reset token from database
    console.log('\n🔑 Step 3: Getting reset token from database...');
    [users] = await db.query(`
        SELECT reset_token, reset_token_expires 
        FROM users 
        WHERE user_name = ?
    `, [username]);

    const resetToken = users[0].reset_token;
    console.log(`   Reset Token: ${resetToken}`);
    console.log(`   Expires: ${users[0].reset_token_expires}`);

    // Step 4: Reset password via API
    console.log(`\n🔄 Step 4: Resetting password via API...`);
    console.log(`   New Password: ${newPassword}`);

    try {
        const resetResp = await axios.post(`${API_URL}/reset-password`, {
            email: username,
            code: resetToken,
            newPassword: newPassword
        });
        console.log(`   ✅ API Response: ${resetResp.data.message}`);
    } catch (e) {
        console.error(`   ❌ API Error:`, e.response?.data || e.message);
        await db.end();
        return;
    }

    // Step 5: Verify password was changed in database
    console.log('\n🔍 Step 5: Verifying database was updated...');
    [users] = await db.query(`
        SELECT password FROM users WHERE user_name = ?
    `, [username]);

    const newHash = users[0].password;
    console.log(`   New hash: ${newHash.substring(0, 30)}...`);
    console.log(`   Hash changed: ${oldHash !== newHash ? '✅ YES' : '❌ NO - PROBLEM HERE!'}`);

    // Step 6: Test new password with bcrypt
    console.log('\n🧪 Step 6: Testing new password with bcrypt...');
    const bcryptMatch = await bcrypt.compare(newPassword, newHash);
    console.log(`   Bcrypt verification: ${bcryptMatch ? '✅ PASS' : '❌ FAIL'}`);

    // Step 7: Test login via API
    console.log(`\n🔐 Step 7: Testing login via API...`);
    try {
        const loginResp = await axios.post(`${API_URL}/login`, {
            user_name: username,
            pass: newPassword
        });

        if (loginResp.data.success) {
            console.log(`   ✅ LOGIN SUCCESSFUL!`);
            console.log(`   Token: ${loginResp.data.token.substring(0, 20)}...`);
        } else {
            console.log(`   ❌ LOGIN FAILED: ${loginResp.data.message}`);
        }
    } catch (e) {
        console.error(`   ❌ LOGIN ERROR:`, e.response?.data || e.message);
    }

    await db.end();

    console.log('\n✅ TEST COMPLETE\n');
}

fullPasswordResetTest().catch(console.error);
