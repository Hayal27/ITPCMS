const mysql = require('mysql2/promise');

async function updateJob() {
    try {
        const db = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'cms_up'
        });

        const [result] = await db.execute('UPDATE jobs SET status = "published" WHERE id = 1');
        console.log('✅ Job status updated to published:', result.affectedRows);

        await db.end();
    } catch (err) {
        console.error('❌ Failed to update job:', err);
    }
}

updateJob();
