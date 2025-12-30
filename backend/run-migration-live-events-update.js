const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'cms',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

const migrationPath = path.join(__dirname, 'models', 'migrations', '006_update_live_events_control.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

connection.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }
    connection.query(migrationSQL, (error) => {
        if (error) {
            console.error('❌ Migration failed:', error.message);
        } else {
            console.log('✅ Live Events Control Update completed successfully!');
        }
        connection.end();
    });
});
