const fs = require('fs');
const db = require('./models/db');

async function runFix() {
    const sql = fs.readFileSync('./fix_menus.sql', 'utf8');
    const statements = sql.split(';').filter(s => s.trim() !== '');

    for (let statement of statements) {
        try {
            await db.promise().query(statement);
            console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (err) {
            console.error('Error executing:', statement.substring(0, 50), '\nError:', err.message);
        }
    }
    console.log('Done!');
    process.exit(0);
}

runFix();
