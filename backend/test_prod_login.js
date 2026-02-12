const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('https://api.ethiopianitpark.et/api/login', {
            user_name: 'test_admin',
            pass: 'Itp@123'
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('--- LOGIN SUCCESS ---');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        console.log('Set-Cookie:', response.headers['set-cookie']);
    } catch (error) {
        console.log('--- LOGIN FAILED ---');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error Message:', error.message);
        }
    }
}

testLogin();
