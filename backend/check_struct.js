const con = require('./models/db');
const util = require('util');
const query = util.promisify(con.query).bind(con);

async function checkTables() {
    try {
        const tables = await query("SHOW TABLES");
        console.log("ALL TABLES:", tables);

        const struct = await query("DESCRIBE blocked_ips");
        console.log("BLOCKED_IPS STRUCT:", struct);

        const content = await query("SELECT * FROM blocked_ips");
        console.log("BLOCKED_IPS CONTENT:", content);

        const attempts = await query("SELECT user_id, user_name, failed_login_attempts, account_locked_until FROM users WHERE failed_login_attempts > 0");
        console.log("USERS WITH FAILED ATTEMPTS:", attempts);

    } catch (err) {
        console.error("ERROR:", err.message);
    } finally {
        process.exit();
    }
}

checkTables();
