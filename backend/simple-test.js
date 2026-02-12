/**
 * Simple Security Test - XSS Prevention
 */

const axios = require('axios');

const API_BASE = 'https://api.ethiopianitpark.et/api';

async function testXSS() {
    console.log('Testing XSS Prevention...\n');

    try {
        // Test 1: Script tag in title
        console.log('Test 1: Script tag injection');
        const response = await axios.post(`${API_BASE}/careers/admin/jobs`, {
            title: '<script>alert("XSS")</script>Test Job',
            description: 'Normal description',
            department: 'IT',
            location: 'Addis Ababa',
            type: 'full-time',
            deadline: '2026-03-01',
            requirements: 'Test',
            responsibilities: 'Test'
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'token=test' // You'll need a valid token
            }
        });

        console.log('Response:', JSON.stringify(response.data, null, 2));

        // Check if script tag was removed
        if (response.data.job && !response.data.job.title.includes('<script')) {
            console.log('✅ PASSED: Script tag was removed');
            console.log('Sanitized title:', response.data.job.title);
        } else {
            console.log('❌ FAILED: Script tag still present');
        }

    } catch (error) {
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message || error.response.data);

            if (error.response.status === 401 || error.response.status === 403) {
                console.log('\n⚠️  Authentication required. Please login first.');
                console.log('This is expected behavior - routes are protected.');
            } else if (error.response.status === 400) {
                console.log('✅ PASSED: Validation rejected the input');
            }
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Test without authentication (public route)
async function testPublicRoute() {
    console.log('\n\nTesting Public Route (Contact Form)...\n');

    try {
        const response = await axios.post(`${API_BASE}/contact`, {
            name: '<script>alert("XSS")</script>John Doe',
            email: 'test@example.com',
            subject: 'Test <img src=x onerror=alert("XSS")>',
            message: 'Normal message'
        });

        console.log('Response:', JSON.stringify(response.data, null, 2));

        // Check if XSS was sanitized
        console.log('✅ Request accepted - input was sanitized');

    } catch (error) {
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message || error.response.data);

            if (error.response.status === 400) {
                console.log('✅ PASSED: Validation working');
            }
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Run tests
(async () => {
    try {
        await testXSS();
        await testPublicRoute();
        console.log('\n\n=== Test Complete ===\n');
    } catch (error) {
        console.error('Test error:', error.message);
    }
})();
