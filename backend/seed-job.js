const pool = require("./models/db.js");
const db = pool.promise();

const seedJob = async () => {
    try {
        const [result] = await db.query(
            "INSERT INTO jobs (title, department, location, type, description, responsibilities, qualifications, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                'Senior Software Engineer (Full Stack)',
                'Engineering',
                'Addis Ababa, Ethiopia',
                'Full-time',
                'We are looking for a world-class Full Stack Engineer to build the future of our digital infrastructure.',
                JSON.stringify(['Architect scalable microservices', 'Lead frontend modernization', 'Optimize DB performance']),
                JSON.stringify(['5+ years React/Node experience', 'Strong SQL skills', 'Cloud native mindset']),
                'published'
            ]
        );
        console.log("✅ Seeded one published job. ID:", result.insertId);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding job:", err);
        process.exit(1);
    }
};

seedJob();
