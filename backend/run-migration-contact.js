const db = require('./models/db');

const createContactTable = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            message TEXT NOT NULL,
            status ENUM('new', 'read', 'replied') DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    try {
        await new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
        console.log('✅ Contact messages table created or already exists');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating contact messages table:', error);
        process.exit(1);
    }
};

createContactTable();
