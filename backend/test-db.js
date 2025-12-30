const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 3306,
});

console.log("Attempting connection on port 33060...");

pool.getConnection((err, connection) => {
    if (err) {
        console.error("Connection failed on 33060:", err.code, err.message);
    } else {
        console.log("SUCCESS! Connected on port 33060.");
        connection.release();
    }
    process.exit();
});
