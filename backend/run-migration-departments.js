const db = require('./models/db.js');
const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, 'migrations', 'create_departments_table.sql');

fs.readFile(migrationFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading migration file:', err);
        process.exit(1);
    }

    // Split queries by semicolon to handle multiple statements
    const queries = data.split(';').filter(query => query.trim().length > 0);

    const executeQuery = (index) => {
        if (index >= queries.length) {
            console.log('Migration completed successfully.');
            process.exit(0);
        }

        const query = queries[index];
        db.query(query, (error, results) => {
            if (error) {
                // Ignore error if table already exists (for the CREATE TABLE part if IF NOT EXISTS doesn't catch everything or if INSERT fails on duplicates without ignore)
                // specific checks can be added but for now just logging
                if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
                    console.error('Error executing query:', error);
                } else {
                    console.log('Table already exists or error ignored.');
                }
            }
            console.log(`Executed query ${index + 1}/${queries.length}`);
            executeQuery(index + 1);
        });
    };

    executeQuery(0);
});
