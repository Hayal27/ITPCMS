const axios = require('axios');

async function testPasswordResetAPI() {
    const API_URL = 'https://api.ethiopianitpark.et';

    console.log('\n🧪 TESTING PASSWORD RESET API\n');

    const testEmail = 'hayalt'; // or email
    const newPassword = 'NewPassword123!';

    try {
        // Step 1: Request reset code
        console.log('Step 1: Requesting password reset code...');
        const forgotResponse = await axios.post(`${API_URL}/forgot-password`, {
            email: testEmail
        });

        console.log('✅ Forgot password response:', forgotResponse.data);

        // You'll need to get the code from the email or database
        console.log('\n⚠️  Check your email or database for the reset code');
        console.log('Then run: node test_reset_api.js <code>');

        if (process.argv[2]) {
            const code = process.argv[2];
            console.log(`\nStep 2: Resetting password with code: ${code}`);

            const resetResponse = await axios.post(`${API_URL}/reset-password`, {
                email: testEmail,
                code: code,
                newPassword: newPassword
            });

            console.log('✅ Reset password response:', resetResponse.data);

            // Step 3: Try to login with new password
            console.log(`\nStep 3: Testing login with new password...`);

            const loginResponse = await axios.post(`${API_URL}/login`, {
                user_name: testEmail,
                pass: newPassword
            });

            if (loginResponse.data.success) {
                console.log('✅ LOGIN SUCCESSFUL with new password!');
                console.log('Token:', loginResponse.data.token);
            } else {
                console.log('❌ LOGIN FAILED:', loginResponse.data.message);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testPasswordResetAPI();
