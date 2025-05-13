const mysql = require("mysql");

const con = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "", // Use an empty string if PASSWORD is undefined
    database: "cms"
});

con.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = con;
