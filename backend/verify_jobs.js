const pool = require("./models/db.js");
const db = pool.promise();

async function checkJobs() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM jobs WHERE Field = 'id'");
        console.log("Jobs ID Column:", rows[0]);
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        process.exit();
    }
}

checkJobs();
