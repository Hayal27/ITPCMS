const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Leased Land and Zones Migration...\n');

// Create database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'itpccms',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

// Read migration file
const migrationPath = path.join(__dirname, 'models', 'migrations', '004_add_leased_land_tables.sql');
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
        connection.query('SHOW TABLES LIKE "land_zones"', (err, rows) => {
            if (err || rows.length === 0) {
                console.error('❌ Error verifying land_zones table');
            } else {
                console.log('✅ land_zones table created.');
            }

            connection.query('SHOW TABLES LIKE "leased_lands"', (err, rows) => {
                if (err || rows.length === 0) {
                    console.error('❌ Error verifying leased_lands table');
                } else {
                    console.log('✅ leased_lands table created.');
                }
                connection.end();
                process.exit(0);
            });
        });
    });
});
