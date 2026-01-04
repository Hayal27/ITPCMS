const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Board and Who We Are Migration...\n');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'cms',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

const migrationPath = path.join(__dirname, 'models', 'migrations', '009_add_board_and_who_we_are.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

connection.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }

    console.log('✅ Connected to database');
    console.log('📝 Running migration...\n');

    connection.query(migrationSQL, (error, results) => {
        if (error) {
            console.error('❌ Migration failed:', error.message);
            connection.end();
            process.exit(1);
        }

        console.log('✅ Migration completed successfully!');

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
                connection.end();
                process.exit(0);
            });
        });
    });
});
