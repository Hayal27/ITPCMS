const db = require('./models/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const migrationPath = path.join(__dirname, 'models', 'migrations', '011_menu_and_permissions.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon, but be careful with nested semicolons/svgs
    // For simplicity, we can try running specific chunks or the whole thing if it works.
    // However, some mysql drivers don't support multiple statements in one query.
    // The previous runMigration.js seemed to just run it.

    // Let's try running it as multiple statements if possible, or split by ';'
    const statements = sql.split(';').filter(s => s.trim() !== '');

    console.log('Starting migration 011...');
    const promisePool = db.promise();
    for (let statement of statements) {
        try {
            if (statement.trim()) {
                await promisePool.query(statement);
            }
        } catch (err) {
            console.error('Error executing statement:', statement);
            console.error(err);
            process.exit(1);
        }
    }
    console.log('Migration 011 completed successfully.');
    process.exit(0);
}

runMigration();
