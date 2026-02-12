const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.production' });

async function fixApplicationsAutoIncrement() {
    let connection;

    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected to database successfully');

        // Step 1: Check current table structure
        console.log('\n1. Checking current table structure...');
        const [columns] = await connection.query(`
      SHOW COLUMNS FROM applications WHERE Field = 'id'
    `);
        console.log('Current id column:', columns[0]);

        // Step 2: Check if there are any records with id = 0
        const [zeroRecords] = await connection.query(`
      SELECT COUNT(*) as count FROM applications WHERE id = 0
    `);
        console.log(`\n2. Records with id=0: ${zeroRecords[0].count}`);

        // Step 3: If there are records with id=0, we need to handle them
        if (zeroRecords[0].count > 0) {
            console.log('\n3. Found records with id=0. Updating them...');

            // Get the maximum id
            const [maxId] = await connection.query(`
        SELECT COALESCE(MAX(id), 0) as max_id FROM applications WHERE id > 0
      `);
            const nextId = maxId[0].max_id + 1;
            console.log(`   Next available ID: ${nextId}`);

            // Update records with id=0 to use the next available id
            await connection.query(`
        UPDATE applications SET id = ? WHERE id = 0
      `, [nextId]);
            console.log(`   ✓ Updated records with id=0 to id=${nextId}`);
        }

        // Step 4: Drop the primary key temporarily
        console.log('\n4. Modifying table structure...');
        try {
            await connection.query(`ALTER TABLE applications DROP PRIMARY KEY`);
            console.log('   ✓ Dropped primary key');
        } catch (error) {
            console.log('   Note: Primary key might already be dropped or different structure');
        }

        // Step 5: Modify the id column to add AUTO_INCREMENT
        await connection.query(`
      ALTER TABLE applications 
      MODIFY COLUMN id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
    `);
        console.log('   ✓ Added AUTO_INCREMENT to id column');

        // Step 6: Get the next auto_increment value
        const [nextAuto] = await connection.query(`
      SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM applications
    `);
        const nextAutoIncrement = nextAuto[0].next_id;

        // Step 7: Set the AUTO_INCREMENT value
        await connection.query(`
      ALTER TABLE applications AUTO_INCREMENT = ?
    `, [nextAutoIncrement]);
        console.log(`   ✓ Set AUTO_INCREMENT to ${nextAutoIncrement}`);

        // Step 8: Re-add other indexes
        console.log('\n5. Re-adding indexes...');
        try {
            await connection.query(`
        ALTER TABLE applications 
        ADD UNIQUE KEY tracking_code (tracking_code)
      `);
            console.log('   ✓ Added unique key for tracking_code');
        } catch (error) {
            console.log('   Note: tracking_code index might already exist');
        }

        try {
            await connection.query(`
        ALTER TABLE applications 
        ADD KEY job_id (job_id)
      `);
            console.log('   ✓ Added index for job_id');
        } catch (error) {
            console.log('   Note: job_id index might already exist');
        }

        // Step 9: Verify the fix
        console.log('\n6. Verifying the fix...');
        const [verifyColumns] = await connection.query(`
      SHOW COLUMNS FROM applications WHERE Field = 'id'
    `);
        console.log('Updated id column:', verifyColumns[0]);

        const [tableStatus] = await connection.query(`
      SHOW TABLE STATUS LIKE 'applications'
    `);
        console.log(`Auto_increment value: ${tableStatus[0].Auto_increment}`);

        console.log('\n✅ SUCCESS! The applications table has been fixed.');
        console.log('   - AUTO_INCREMENT has been added to the id column');
        console.log('   - New applications will automatically get unique IDs');
        console.log('\nYou can now submit applications without the duplicate entry error.');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed.');
        }
    }
}

// Run the fix
fixApplicationsAutoIncrement();
