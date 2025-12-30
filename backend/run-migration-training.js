
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Training & Workshops Migration...\n');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'cms',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

const migrationPath = path.join(__dirname, 'migrations', '009_add_training_tables.sql');
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

        connection.query('SHOW TABLES LIKE "training_workshops"', (err, rows) => {
            if (err || rows.length === 0) {
                console.error('❌ training_workshops table not found!');
            } else {
                console.log('✅ training_workshops table created.');
            }
            connection.end();
            process.exit(0);
        });
    });
});
