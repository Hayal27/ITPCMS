const mysql = require('mysql2');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
});

const migrationFile = path.join(__dirname, 'migrations', 'create_jobs_tables.sql');
const migrationSql = fs.readFileSync(migrationFile, 'utf8');

connection.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database.');

    connection.query(migrationSql, (err, results) => {
        if (err) {
            console.error('Error running migration:', err);
        } else {
            console.log('Migration executed successfully.');
        }
        connection.end();
    });
});
