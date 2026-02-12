const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('Hint: The port might be wrong or the service is not listening on this interface.');
        }
    } else {
        console.log('✅ Connected successfully to localhost:3306');
        connection.end();
    }
    process.exit();
});
