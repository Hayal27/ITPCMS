const pool = require("./models/db.js");
const db = pool.promise();

const upgradeApplicationsTable = async () => {
    try {
        // Update Status ENUM
        await db.query(`ALTER TABLE applications MODIFY COLUMN status ENUM('pending', 'reviewing', 'shortlisted', 'written_exam', 'interview_shortlisted', 'interviewing', 'offered', 'rejected') DEFAULT 'pending'`);

        // Add appointment related columns
        await db.query(`ALTER TABLE applications ADD COLUMN appointment_date DATE AFTER admin_notes`);
        await db.query(`ALTER TABLE applications ADD COLUMN appointment_time TIME AFTER appointment_date`);
        await db.query(`ALTER TABLE applications ADD COLUMN appointment_location VARCHAR(255) AFTER appointment_time`);
        await db.query(`ALTER TABLE applications ADD COLUMN appointment_details TEXT AFTER appointment_location`);

        console.log("✅ Upgraded applications table with new statuses and appointment fields.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error upgrading applications table:", err);
        process.exit(1);
    }
};

upgradeApplicationsTable();
