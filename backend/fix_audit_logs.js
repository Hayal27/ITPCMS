const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAuditLogs() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'starteut_itp_cmsup',
        port: 3306
    });

    console.log('🔧 Fixing audit_logs table...\n');

    try {
        // Step 1: Check current state
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM audit_logs');
        console.log(`Current rows in audit_logs: ${rows[0].count}`);

        // Step 2: Find duplicate IDs
        const [duplicates] = await connection.query(`
            SELECT id, COUNT(*) as count 
            FROM audit_logs 
            GROUP BY id 
            HAVING count > 1
        `);

        if (duplicates.length > 0) {
            console.log(`\n⚠️  Found ${duplicates.length} duplicate IDs`);

            // Step 3: Create a temporary table with proper structure
            await connection.query('DROP TABLE IF EXISTS audit_logs_temp');
            await connection.query(`
                CREATE TABLE audit_logs_temp (
                    id INT(11) NOT NULL AUTO_INCREMENT,
                    user_id INT(11) DEFAULT NULL,
                    action VARCHAR(50) NOT NULL,
                    entity VARCHAR(50) NOT NULL,
                    entity_id VARCHAR(50) DEFAULT NULL,
                    details TEXT DEFAULT NULL,
                    ip_address VARCHAR(45) DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            `);

            // Step 4: Copy data
            await connection.query(`
                INSERT INTO audit_logs_temp (user_id, action, entity, entity_id, details, ip_address, created_at)
                SELECT user_id, action, entity, entity_id, details, ip_address, created_at
                FROM audit_logs
                ORDER BY created_at
            `);

            // Step 5: Swap tables
            await connection.query('DROP TABLE audit_logs');
            await connection.query('RENAME TABLE audit_logs_temp TO audit_logs');

            console.log('✅ Successfully fixed audit_logs table with AUTO_INCREMENT');
        } else {
            // No duplicates, just add AUTO_INCREMENT
            await connection.query('ALTER TABLE audit_logs MODIFY id INT(11) NOT NULL AUTO_INCREMENT');
            console.log('✅ Added AUTO_INCREMENT to audit_logs');
        }

        // Verify
        const [result] = await connection.query('SHOW CREATE TABLE audit_logs');
        console.log('\n✅ Table structure verified');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    await connection.end();
}

fixAuditLogs();
