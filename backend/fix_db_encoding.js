const pool = require('./models/db');

async function fixEncoding() {
    console.log('Starting DB Encoding Fix...');
    try {
        const promisePool = pool.promise();

        // 1. Convert Table charset to ensure it holds utf8mb4 data
        console.log('Converting table id_card_persons to utf8mb4...');
        await promisePool.query('ALTER TABLE id_card_persons CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

        // 2. Explicitly modify the Amharic columns to be sure
        console.log('Ensuring specific columns are utf8mb4...');
        // We modify them to have the correct charset. nullable as per schema.
        const modifySql = `
      ALTER TABLE id_card_persons 
      MODIFY fname_am VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      MODIFY lname_am VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      MODIFY position_am VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;
        await promisePool.query(modifySql);

        console.log('✅ Database fix complete. Table and columns are now utf8mb4.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing encoding:', err);
        process.exit(1);
    }
}

// Give a moment for connection pool to initialize
setTimeout(fixEncoding, 1000);
