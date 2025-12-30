const pool = require("./models/db.js");
const db = pool.promise();

const createCareerTables = async () => {
    const jobTableQuery = `
    CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      location VARCHAR(255),
      type ENUM('Full-time', 'Part-time', 'Contract', 'Internship') DEFAULT 'Full-time',
      description TEXT,
      responsibilities TEXT, -- Stored as JSON or delimited string
      qualifications TEXT,  -- Stored as JSON or delimited string
      status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

    const applicationTableQuery = `
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT,
      tracking_code VARCHAR(20) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      linkedin VARCHAR(255),
      portfolio VARCHAR(255),
      resume_path VARCHAR(255),
      cover_letter TEXT,
      status ENUM('pending', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'rejected') DEFAULT 'pending',
      admin_notes TEXT,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
    );
  `;

    try {
        await db.query(jobTableQuery);
        console.log("✅ Jobs table created or already exists.");

        await db.query(applicationTableQuery);
        console.log("✅ Applications table created or already exists.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error creating career tables:", err);
        process.exit(1);
    }
};

createCareerTables();
