const db = require('./db');

const checkSchema = async () => {
    try {
        const [columns] = await db.promise().query('SHOW COLUMNS FROM leased_lands');
        console.log('Columns in leased_lands:');
        console.table(columns);

        const [indexes] = await db.promise().query('SHOW INDEX FROM leased_lands');
        console.log('Indexes in leased_lands:');
        console.table(indexes);

        const [foreignKeys] = await db.promise().query(`
            SELECT 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE
                TABLE_NAME = 'leased_lands' AND
                REFERENCED_TABLE_NAME IS NOT NULL
        `);
        console.log('Foreign Keys in leased_lands:');
        console.table(foreignKeys);

    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        process.exit();
    }
};

checkSchema();
