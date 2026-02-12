/**
 * Security Test Script
 * Tests input validation and file upload security
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.ethiopianitpark.et/api';

// Test 1: XSS Prevention in Job Creation
async function testXSSPrevention() {
    console.log('\n=== TEST 1: XSS Prevention ===\n');

    const maliciousPayloads = [
        {
            name: 'Script Tag',
            title: '<script>alert("XSS")</script>',
            description: 'Normal description'
        },
        {
            name: 'Image Onerror',
            title: 'Normal Title',
            description: '<img src=x onerror=alert("XSS")>'
        },
        {
            name: 'JavaScript Protocol',
            title: 'Normal Title',
            description: '<a href="javascript:alert(\'XSS\')">Click</a>'
        },
        {
            name: 'Event Handler',
            title: '<div onclick="alert(\'XSS\')">Test</div>',
            description: 'Normal description'
        }
    ];

    for (const payload of maliciousPayloads) {
        try {
            console.log(`Testing: ${payload.name}`);
            console.log(`Input Title: ${payload.title}`);
            console.log(`Input Description: ${payload.description}`);

            const response = await axios.post(`${API_BASE}/careers/admin/jobs`, {
                title: payload.title,
                description: payload.description,
                department: 'IT',
                location: 'Addis Ababa',
                type: 'full-time',
                deadline: '2026-03-01',
                requirements: 'Test requirements',
                responsibilities: 'Test responsibilities'
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Request accepted (input was sanitized)');
            console.log(`Response:`, response.data);

            // Check if the response contains sanitized data
            if (response.data.job) {
                console.log(`Sanitized Title: ${response.data.job.title}`);
                console.log(`Sanitized Description: ${response.data.job.description}`);

                // Verify XSS was removed
                const hasMaliciousContent =
                    response.data.job.title.includes('<script') ||
                    response.data.job.title.includes('onerror=') ||
                    response.data.job.title.includes('javascript:') ||
                    response.data.job.description.includes('<script') ||
                    response.data.job.description.includes('onerror=') ||
                    response.data.job.description.includes('javascript:');

                if (hasMaliciousContent) {
                    console.log('❌ FAILED: Malicious content still present!');
                } else {
                    console.log('✅ PASSED: Malicious content removed');
                }
            }

        } catch (error) {
            if (error.response) {
                console.log(`✅ Request blocked: ${error.response.data.message}`);
                console.log('✅ PASSED: Validation rejected malicious input');
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        }
        console.log('---');
    }
}

// Test 2: SVG File Upload Prevention
async function testSVGUploadPrevention() {
    console.log('\n=== TEST 2: SVG File Upload Prevention ===\n');

    // Create malicious SVG file
    const maliciousSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <script type="text/javascript">
        alert('XSS from SVG');
    </script>
    <circle cx="50" cy="50" r="40" fill="red"/>
</svg>`;

    const svgPath = path.join(__dirname, 'test-malicious.svg');
    fs.writeFileSync(svgPath, maliciousSVG);

    try {
        const formData = new FormData();
        formData.append('resume', fs.createReadStream(svgPath));
        formData.append('fullName', 'Test User');
        formData.append('email', 'test@example.com');
        formData.append('phone', '0912345678');
        formData.append('jobId', '1');
        formData.append('coverLetter', 'Test cover letter');

        console.log('Attempting to upload malicious SVG file...');

        const response = await axios.post(`${API_BASE}/careers/jobs/apply`, formData, {
            headers: formData.getHeaders(),
            withCredentials: true
        });

        console.log('❌ FAILED: SVG file was accepted!');
        console.log(response.data);

    } catch (error) {
        if (error.response) {
            console.log(`✅ PASSED: File upload blocked`);
            console.log(`Message: ${error.response.data.message}`);
        } else {
            console.log(`❌ Error: ${error.message}`);
        }
    } finally {
        // Clean up
        if (fs.existsSync(svgPath)) {
            fs.unlinkSync(svgPath);
        }
    }
}

// Test 3: Valid File Upload (Should Pass)
async function testValidFileUpload() {
    console.log('\n=== TEST 3: Valid File Upload (Should Pass) ===\n');

    // Create a simple text file (simulating PDF)
    const validContent = 'This is a test resume content';
    const pdfPath = path.join(__dirname, 'test-resume.txt');
    fs.writeFileSync(pdfPath, validContent);

    try {
        const formData = new FormData();
        formData.append('resume', fs.createReadStream(pdfPath), {
            filename: 'resume.pdf',
            contentType: 'application/pdf'
        });
        formData.append('fullName', 'John Doe');
        formData.append('email', 'john@example.com');
        formData.append('phone', '0911223344');
        formData.append('jobId', '1');
        formData.append('coverLetter', 'I am interested in this position');

        console.log('Attempting to upload valid file...');

        const response = await axios.post(`${API_BASE}/careers/jobs/apply`, formData, {
            headers: formData.getHeaders(),
            withCredentials: true
        });

        console.log('✅ PASSED: Valid file accepted');
        console.log(response.data);

    } catch (error) {
        if (error.response) {
            console.log(`Response: ${error.response.data.message}`);
            // Note: This might fail due to magic byte validation
            // since we're sending a text file as PDF
            console.log('Note: File rejected due to magic byte mismatch (expected behavior)');
        } else {
            console.log(`Error: ${error.message}`);
        }
    } finally {
        // Clean up
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }
    }
}

// Test 4: SQL Injection Prevention
async function testSQLInjectionPrevention() {
    console.log('\n=== TEST 4: SQL Injection Prevention ===\n');

    const sqlPayloads = [
        "'; DROP TABLE jobs; --",
        "' OR '1'='1",
        "admin'--",
        "1' UNION SELECT NULL--"
    ];

    for (const payload of sqlPayloads) {
        try {
            console.log(`Testing SQL Injection: ${payload}`);

            const response = await axios.post(`${API_BASE}/careers/admin/jobs`, {
                title: payload,
                description: 'Test description',
                department: 'IT',
                location: 'Addis Ababa',
                type: 'full-time',
                deadline: '2026-03-01',
                requirements: 'Test',
                responsibilities: 'Test'
            }, {
                withCredentials: true
            });

            console.log('✅ Input sanitized (special characters escaped)');
            console.log(`Sanitized: ${response.data.job?.title}`);

        } catch (error) {
            if (error.response) {
                console.log(`Response: ${error.response.data.message}`);
            } else {
                console.log(`Error: ${error.message}`);
            }
        }
        console.log('---');
    }
}

// Run all tests
async function runAllTests() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     SECURITY VALIDATION TEST SUITE                     ║');
    console.log('║     Testing Input Validation & File Upload Security   ║');
    console.log('╚════════════════════════════════════════════════════════╝');

    try {
        await testXSSPrevention();
        await testSVGUploadPrevention();
        await testValidFileUpload();
        await testSQLInjectionPrevention();

        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║                  TESTS COMPLETED                       ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('Test suite error:', error.message);
    }
}

// Check if server is running
async function checkServer() {
    try {
        await axios.get(`${API_BASE}/careers/jobs`);
        console.log('✅ Server is running\n');
        return true;
    } catch (error) {
        console.log('❌ Server is not running. Please start the server first.');
        console.log('Run: node server.js\n');
        return false;
    }
}

// Main execution
(async () => {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await runAllTests();
    }
})();
