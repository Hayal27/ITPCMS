const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'cms',
    port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error:', err);
        process.exit(1);
    }

    console.log('✅ Verifying subscribers table...\n');

    connection.query('DESCRIBE subscribers', (err, rows) => {
        if (err) {
            console.error('❌ Table not found:', err.message);
            connection.end();
            process.exit(1);
        }

        console.log('✅ Subscribers table exists!');
        console.log('\nTable Structure:');
        console.table(rows);

        connection.query('SELECT COUNT(*) as count FROM subscribers', (err, result) => {
            if (!err) {
                console.log(`\n📊 Total subscribers: ${result[0].count}`);
            }

            console.log('\n✅ Database migration verified successfully!');
            connection.end();
        });
    });
});
