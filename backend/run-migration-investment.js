
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cms',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

const connection = mysql.createConnection(dbConfig);

const migrationFile = path.join(__dirname, 'migrations', '010_add_investment_tables.sql');
const migrationSql = fs.readFileSync(migrationFile, 'utf8');

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database.');

    connection.query(migrationSql, (error, results) => {
        if (error) {
            console.error('Error applying migration:', error);
        } else {
            console.log('Migration 010_add_investment_tables applied successfully.');
        }
        connection.end();
    });
});
