const pool = require('./models/db.js');
const db = pool.promise();

(async () => {
    try {
        await db.query("ALTER TABLE applications ADD COLUMN appointment_lat DECIMAL(10, 8) NULL AFTER appointment_location");
        await db.query("ALTER TABLE applications ADD COLUMN appointment_lng DECIMAL(11, 8) NULL AFTER appointment_lat");
        console.log("Migration successful: Added appointment_lat and appointment_lng columns.");
        process.exit(0);
    } catch (err) {
        // Ignore if column exists
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Columns already exist.");
            process.exit(0);
        }
        console.error("Migration failed:", err);
        process.exit(1);
    }
})();
