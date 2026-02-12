const pool = require("./models/db.js");
const db = pool.promise();

async function checkSchema() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM applications WHERE Field = 'id'");
        if (rows.length > 0) {
            console.log(`Column: ${rows[0].Field}, Extra: ${rows[0].Extra}`);
            if (rows[0].Extra.includes('auto_increment')) {
                console.log("SUCCESS: AUTO_INCREMENT IS ACTIVE");
            } else {
                console.log("FAILURE: AUTO_INCREMENT IS MISSING");
            }
        } else {
            console.log("FAILURE: ID COLUMN NOT FOUND");
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        process.exit();
    }
}

checkSchema();
