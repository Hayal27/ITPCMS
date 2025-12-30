
const mysql = require('mysql');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cms',
    port: process.env.DB_PORT || 3306
};

const connection = mysql.createConnection(dbConfig);

const INVEST_STEPS = [
    {
        step_number: 1,
        title: "Submit Expression of Interest",
        description: "Begin your journey with a short online form outlining your business scope and interest.",
        doc_url: "/docs/expression-of-interest.pdf",
        status: 'active'
    },
    {
        step_number: 2,
        title: "Initial Consultation",
        description: "Our investment experts will connect with you to understand your goals and explain tailored opportunities.",
        doc_url: "/docs/initial-consultation.pdf",
        status: 'active'
    },
    {
        step_number: 3,
        title: "Proposal Submission",
        description: "Submit a detailed proposal. Templates and support documents are available for download.",
        doc_url: "/docs/proposal-template.pdf",
        status: 'active'
    },
    {
        step_number: 4,
        title: "Site Allocation & Licensing",
        description: "Choose your preferred zone (BPO, Software Dev, AI, etc.) and receive guidance on securing legal licensing.",
        doc_url: "/docs/site-allocation-guide.pdf",
        status: 'active'
    },
    {
        step_number: 5,
        title: "Legal Setup & Registration",
        description: "Company registration, MoU signing, and onboarding with our regulatory support desk.",
        doc_url: "/docs/legal-setup-checklist.pdf",
        status: 'active'
    },
    {
        step_number: 6,
        title: "Operational Kick-off",
        description: "Begin setting up infrastructure, recruiting local talent, and accessing park resources.",
        doc_url: "/docs/operational-kickoff.pdf",
        status: 'active'
    },
];

const RESOURCES = [
    { label: "Business Templates", icon: "FaFileAlt", file_url: "/docs/business-templates.zip", type: "zip" },
    { label: "Registration Forms", icon: "FaFileSignature", file_url: "/docs/registration-forms.zip", type: "zip" },
    { label: "Legal Guidelines", icon: "FaGavel", file_url: "/docs/legal-guidelines.pdf", type: "pdf" },
    { label: "Zone Maps (PDF)", icon: "FaMapMarkedAlt", file_url: "/docs/zone-maps.pdf", type: "pdf" },
    { label: "Tax & Policy Summary", icon: "FaRegLightbulb", file_url: "/docs/tax-policy-summary.pdf", type: "pdf" },
];

connection.connect((err) => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected.');

    // Clear existing to avoid duplicates if re-run (optional, but good for dev)
    // connection.query('TRUNCATE TABLE investment_steps', () => {});
    // connection.query('TRUNCATE TABLE investment_resources', () => {});

    let pending = 0;

    INVEST_STEPS.forEach(s => {
        pending++;
        connection.query(
            'INSERT INTO investment_steps (step_number, title, description, doc_url, status) VALUES (?, ?, ?, ?, ?)',
            [s.step_number, s.title, s.description, s.doc_url, s.status],
            (err) => {
                if (err) console.error("Step insert error", err);
                pending--;
                checkDone();
            }
        );
    });

    RESOURCES.forEach(r => {
        pending++;
        connection.query(
            'INSERT INTO investment_resources (label, icon, file_url, type) VALUES (?, ?, ?, ?)',
            [r.label, r.icon, r.file_url, r.type],
            (err) => {
                if (err) console.error("Resource insert error", err);
                pending--;
                checkDone();
            }
        );
    });

    function checkDone() {
        if (pending === 0) {
            console.log("Mock data migration complete.");
            connection.end();
        }
    }
});
