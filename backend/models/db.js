const mysql = require("mysql2"); // Restored to mysql2 for Promise support
require('dotenv').config();

const isRemote = process.env.USE_REMOTE_DB === "true";

const dbConfig = isRemote ? {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT || "33636", 10),
} : {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cms',
  port: parseInt(process.env.DB_PORT || "3306", 10),
};

const pool = mysql.createPool({
  connectionLimit: 10,
  ...dbConfig
});

// Database configuration loaded successfully (mysql2)

module.exports = pool;