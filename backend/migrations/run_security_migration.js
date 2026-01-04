const fs = require('fs');
const path = require('path');
const db = require('../models/db');

const migrationFile = path.join(__dirname, 'security_updates.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

// Split by semicolon to handle multiple statements not supported by default query
const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

const runMigration = async () => {
    console.log("Running security migration...");
    for (const statement of statements) {
        if (statement.trim()) {
            try {
                await new Promise((resolve, reject) => {
                    db.query(statement, (err, result) => {
                        if (err) {
                            // Ignore "Duplicate column name" or "Table already exists" errors to make it idempotent
                            if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
                                console.log("Skipping duplicate/existing item.");
                                resolve();
                            } else {
                                reject(err);
                            }
                        } else {
                            console.log("Executed successfully.");
                            resolve(result);
                        }
                    });
                });
            } catch (err) {
                console.error("Migration Error:", err);
            }
        }
    }
    console.log("Migration finished.");
    process.exit(0);
};

runMigration();
