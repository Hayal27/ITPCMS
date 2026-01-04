const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Board and Who We Are Migration (REMOTE DB)...\n');

// Use remote database configuration (same as db.remote.js)
const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    multipleStatements: true
});

const migrationPath = path.join(__dirname, 'models', 'migrations', '009_add_board_and_who_we_are.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

connection.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to REMOTE database:', err.message);
        process.exit(1);
    }

    console.log('✅ Connected to REMOTE database');
    console.log('📝 Running migration...\n');

    connection.query(migrationSQL, (error, results) => {
        if (error) {
            console.error('❌ Migration failed:', error.message);
            connection.end();
            process.exit(1);
        }

        console.log('✅ Migration completed successfully on REMOTE database!');

        connection.query('DESCRIBE board_members', (err, rows) => {
            if (rows) {
                console.log('\n✅ Board Members table structure:');
                console.table(rows);
            }
            connection.query('DESCRIBE who_we_are_sections', (err, rows2) => {
                if (rows2) {
                    console.log('\n✅ Who We Are Sections table structure:');
                    console.table(rows2);
                }

                // Check if data was inserted
                connection.query('SELECT COUNT(*) as count FROM board_members', (err, count) => {
                    if (count) {
                        console.log(`\n✅ Board Members count: ${count[0].count}`);
                    }
                    connection.query('SELECT COUNT(*) as count FROM who_we_are_sections', (err, count2) => {
                        if (count2) {
                            console.log(`✅ Who We Are Sections count: ${count2[0].count}`);
                        }
                        connection.end();
                        process.exit(0);
                    });
                });
            });
        });
    });
});
