const pool = require("./models/db.js");
const db = pool.promise();

const addMissingColumns = async () => {
    try {
        await db.query(`ALTER TABLE applications ADD COLUMN education TEXT AFTER cover_letter`);
        await db.query(`ALTER TABLE applications ADD COLUMN work_experience TEXT AFTER education`);
        await db.query(`ALTER TABLE applications ADD COLUMN skills TEXT AFTER work_experience`);
        console.log("✅ Added missing columns: education, work_experience, skills to applications table.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating applications table:", err);
        process.exit(1);
    }
};

addMissingColumns();
