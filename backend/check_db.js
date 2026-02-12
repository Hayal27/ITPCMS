const mysql = require('mysql2/promise');

async function checkData() {
    const con = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cms_up'
    });

    try {
        const [rows] = await con.execute('SELECT * FROM id_card_persons LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await con.end();
    }
}

checkData();
