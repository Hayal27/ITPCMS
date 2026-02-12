const pool = require("./models/db.js");
const db = pool.promise();

async function checkSchema() {
    try {
        const [rows] = await db.query("DESCRIBE applications");
        console.log("Applications Fields:");
        rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));

        const [jobs] = await db.query("DESCRIBE jobs");
        console.log("\nJobs Fields:");
        jobs.forEach(r => console.log(`- ${r.Field} (${r.Type})`));

    } catch (error) {
        console.error("Error checking schema:", error.message);
    } finally {
        process.exit();
    }
}

checkSchema();
