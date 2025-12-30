const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Partners & Investors Migration...\n');

// Create database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'cms',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

// Read migration file
const migrationPath = path.join(__dirname, 'models', 'migrations', '003_add_partners_investors_tables.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Connect and run migration
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

        // Verify tables
        connection.query('SHOW TABLES LIKE "partners"', (err, rows) => {
            if (err || rows.length === 0) {
                console.error('❌ partners table not found!');
            } else {
                console.log('✅ partners table created.');
            }

            connection.query('SHOW TABLES LIKE "investors"', (err, rows) => {
                if (err || rows.length === 0) {
                    console.error('❌ investors table not found!');
                } else {
                    console.log('✅ investors table created.');
                }
                connection.end();
                process.exit(0);
            });
        });
    });
});
