const mysql = require("mysql");
require('dotenv').config();

const con = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER,
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT || 3306, // default MySQL port if not set
});

con.connect((err) => {
  if (err) {
    console.error("Error connecting to remote MySQL:", err);
    return;
  }
  console.log("Connected to remote MySQL database");
});

module.exports = con;
