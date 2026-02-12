const pool = require("./models/db.js");
const db = pool.promise();

async function fixApplications() {
    try {
        console.log("Starting fix for applications table...");

        // 1. Move all IDs to a very high range to avoid collisions during re-indexing
        await db.query("UPDATE applications SET id = id + 1000");
        console.log("Moved IDs to temporary high range.");

        // 2. Re-index starting from 1
        const [rows] = await db.query("SELECT id FROM applications ORDER BY id ASC");
        for (let i = 0; i < rows.length; i++) {
            const oldId = rows[i].id;
            const newId = i + 1;
            await db.query("UPDATE applications SET id = ? WHERE id = ?", [newId, oldId]);
            console.log(`Re-indexed ${oldId} -> ${newId}`);
        }

        // 3. Apply AUTO_INCREMENT
        await db.query("ALTER TABLE applications MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT");
        console.log("Applied AUTO_INCREMENT to applications.id");

        const [verify] = await db.query("SHOW COLUMNS FROM applications WHERE Field = 'id'");
        console.log("Verification:", verify[0]);

    } catch (error) {
        console.error("Critical Error during fix:", error.message);
    } finally {
        process.exit();
    }
}

fixApplications();
