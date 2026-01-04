const db = require('./models/db.js');
const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, 'migrations', 'audit_logs.sql');

fs.readFile(migrationFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading migration file:', err);
        process.exit(1);
    }

    // Split queries by semicolon to handle multiple statements if any (though currently just one)
    const queries = data.split(';').filter(query => query.trim().length > 0);

    const executeQuery = (index) => {
        if (index >= queries.length) {
            console.log('Migration completed successfully.');
            process.exit(0);
        }

        const query = queries[index];
        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                process.exit(1);
            }
            console.log(`Executed query ${index + 1}/${queries.length}`);
            executeQuery(index + 1);
        });
    };

    executeQuery(0);
});
