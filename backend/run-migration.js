const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Newsletter Subscription Migration...\n');

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
const migrationPath = path.join(__dirname, 'models', 'migrations', '001_add_subscribers_table.sql');
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
        console.log('\n📊 Migration Results:');

        // Verify table was created
        connection.query('DESCRIBE subscribers', (err, rows) => {
            if (err) {
                console.error('❌ Error verifying table:', err.message);
            } else {
                console.log('\n✅ Subscribers table structure:');
                console.table(rows);
            }

            // Check if any data exists
            connection.query('SELECT COUNT(*) as count FROM subscribers', (err, result) => {
                if (err) {
                    console.error('❌ Error counting records:', err.message);
                } else {
                    console.log(`\n📈 Current subscriber count: ${result[0].count}`);
                }

                console.log('\n🎉 Migration process complete!');
                console.log('\nNext steps:');
                console.log('1. Start the backend server: node server.js');
                console.log('2. Test subscription via the website footer');
                console.log('3. Configure email settings in .env file\n');

                connection.end();
                process.exit(0);
            });
        });
    });
});

// Handle connection errors
connection.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
});
