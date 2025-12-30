const pool = require('./models/db.js');
const db = pool.promise();

(async () => {
    try {
        await db.query("ALTER TABLE applications ADD COLUMN appointment_map_link TEXT AFTER appointment_location");
        console.log("Migration successful: Added appointment_map_link column.");
        process.exit(0);
    } catch (err) {
        // Ignore if column exists
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
            process.exit(0);
        }
        console.error("Migration failed:", err);
        process.exit(1);
    }
})();
