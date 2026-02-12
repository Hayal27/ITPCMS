const { sendEmail } = require('./services/emailService');
const path = require('path');
require('dotenv').config();

async function testEmail() {
    console.log('Testing email service...');
    const result = await sendEmail({
        to: 'hayaltamrat3@gmail.com', // Using the email from the screenshot
        subject: 'ITPC Test Reply',
        html: '<p>This is a test reply from the system.</p>'
    });
    console.log('Result:', result);
    process.exit(0);
}

testEmail().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
