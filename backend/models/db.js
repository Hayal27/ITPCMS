const mysql = require("mysql2");
const path = require('path');
const fs = require('fs');

// Robust environment detection
const isProd = process.env.NODE_ENV === "production";
const envFile = isProd ? ".env.production" : ".env";

// Try multiple path resolutions for Plesk/Production reliability
const possiblePaths = [
  path.resolve(__dirname, '..', envFile),      // backend/.env.production
  path.resolve(process.cwd(), envFile),        // current working directory
  path.resolve(process.cwd(), 'backend', envFile) // root/backend/.env.production
];

let envPath = possiblePaths[0];
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    envPath = p;
    break;
  }
}

require('dotenv').config({ path: envPath });
console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📡 Loading DB config from: ${envPath}`);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cms_up',
  port: parseInt(process.env.DB_PORT || "3306", 10),
};

const pool = mysql.createPool({
  connectionLimit: 10,
  connectTimeout: 10000,
  charset: 'utf8mb4',
  ...dbConfig
});

console.log(`📡 DB Config: Host=${dbConfig.host}, Database=${dbConfig.database}, User=${dbConfig.user}`);

// Test database connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Config:', dbConfig);
  } else {
    console.log('✅ Database connected successfully');
    connection.release();
  }
});

// Database configuration loaded successfully (mysql2)

module.exports = pool;


