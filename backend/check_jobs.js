const pool = require("./models/db.js");
const db = pool.promise();

async function checkJobs() {
    try {
        const [rows] = await db.query("SELECT id, title, status FROM jobs");
        console.log(`Total jobs: ${rows.length}`);
        rows.forEach(r => console.log(`- [${r.id}] ${r.title} (${r.status})`));
    } catch (error) {
        console.error("Error checking jobs:", error.message);
    } finally {
        process.exit();
    }
}

checkJobs();
