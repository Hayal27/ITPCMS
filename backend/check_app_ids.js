const pool = require("./models/db.js");
const db = pool.promise();

async function checkRows() {
    try {
        const [rows] = await db.query("SELECT id FROM applications");
        console.log("Current IDs in applications:", rows.map(r => r.id));
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        process.exit();
    }
}

checkRows();
