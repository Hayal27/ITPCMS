const mysql = require('mysql2/promise');

async function checkData() {
    const con = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cms_up'
    });

    try {
        const [tables] = await con.execute('SHOW TABLES');
        console.log('Tables:', tables);
    } catch (err) {
        console.error(err);
    } finally {
        await con.end();
    }
}

checkData();
