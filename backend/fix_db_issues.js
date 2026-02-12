const db = require('./models/db');
const path = require('path');

// Ensure we load the right env based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

console.log(`🔧 Running DB Fix in ${process.env.NODE_ENV || 'development'} mode using ${envFile}`);

const fixTable = async (tableName, idColumn = 'id') => {
    console.log(`Checking table: ${tableName}...`);
    try {
        // 1. Check if AUTO_INCREMENT is missing
        const [columns] = await new Promise((resolve, reject) => {
            db.query(`SHOW COLUMNS FROM ${tableName} WHERE Field = ?`, [idColumn], (err, results) => {
                if (err) reject(err);
                else resolve([results]);
            });
        });

        const column = columns[0];
        if (!column) {
            console.log(`❌ Column ${idColumn} not found in ${tableName}`);
            return;
        }

        if (column.Extra.toLowerCase().includes('auto_increment')) {
            console.log(`✅ Table ${tableName} already has AUTO_INCREMENT.`);
            return;
        }

        console.log(`🔧 Fixing table ${tableName}...`);

        // 2. Fix multiple 0 or duplicate entries
        // Get all IDs
        const rows = await new Promise((resolve, reject) => {
            db.query(`SELECT ${idColumn} FROM ${tableName} ORDER BY ${idColumn} ASC`, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // We will re-index every row to be safe and ensure continuity
        console.log(`   Re-indexing ${rows.length} rows to ensure uniqueness...`);
        for (let i = 0; i < rows.length; i++) {
            const oldId = rows[i][idColumn];
            const newId = i + 1;
            // Use a temporary update strategy to avoid collisions during the process if needed, 
            // but since we are doing it one by one and eventually the column will be AI, it's fine.
            // We use a specific LIMIT 1 to only update one row at a time if multiple 0s exist.
            await new Promise((resolve) => {
                db.query(`UPDATE ${tableName} SET ${idColumn} = ? WHERE ${idColumn} = ? LIMIT 1`, [newId, oldId], () => resolve());
            });
        }

        // 3. Apply PRIMARY KEY (in case it is missing)
        await new Promise((resolve) => {
            db.query(`ALTER TABLE ${tableName} ADD PRIMARY KEY (${idColumn})`, (err) => {
                if (err && !err.message.includes('Multiple primary key defined')) {
                    console.error(`   Warning on PK: ${err.message}`);
                }
                resolve();
            });
        });

        // 4. Apply AUTO_INCREMENT
        await new Promise((resolve, reject) => {
            db.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${idColumn} INT NOT NULL AUTO_INCREMENT`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`🚀 Successfully fixed ${tableName}!`);
    } catch (error) {
        console.error(`❌ Error fixing ${tableName}:`, error.message);
    }
};

const runFix = async () => {
    // List of tables that usually need auto_increment
    const tables = [
        { name: 'contact_messages', id: 'id' },
        { name: 'subscribers', id: 'id' },
        { name: 'investor_inquiries', id: 'id' },
        { name: 'audit_logs', id: 'id' },
        { name: 'comments', id: 'id' },
        { name: 'events', id: 'id' },
        { name: 'news', id: 'id' },
        { name: 'departments', id: 'department_id' },
        { name: 'employees', id: 'employee_id' },
        { name: 'users', id: 'user_id' },
        { name: 'board_members', id: 'id' },
        { name: 'applications', id: 'id' },
        { name: 'jobs', id: 'id' }
    ];

    for (const table of tables) {
        await fixTable(table.name, table.id);
    }
    console.log('\nAll checks complete.');
    process.exit(0);
};

runFix();
