const pool = require("./models/db.js");
const db = pool.promise();

const addGenderAndRefineColumns = async () => {
    try {
        await db.query(`ALTER TABLE applications ADD COLUMN gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') AFTER full_name`);
        console.log("✅ Added gender column to applications table.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating applications table:", err);
        process.exit(1);
    }
};

addGenderAndRefineColumns();
