const mysql = require("mysql");
require('dotenv').config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQLHOST  ,
  user: process.env.MYSQLUSER ,
  password: process.env.MYSQLPASSWORD ,
  database: process.env.MYSQLDATABASE ,
  port: process.env.MYSQLPORT , // default MySQL port if not set
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Remote Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Remote Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Remote Database connection was refused.');
    }
    console.error("Error connecting to remote MySQL:", err);
    return;
  }
  if (connection) {
    console.log("Connected to remote MySQL database (via pool)");
    connection.release();
  }
});

module.exports = pool;
