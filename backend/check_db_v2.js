const mysql = require('mysql2/promise');
const fs = require('fs');

async function checkData() {
    const con = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cms_up'
    });

    try {
        const [rows] = await con.execute('SELECT * FROM id_card_persons WHERE id_number = "1000005"');
        const [fields] = await con.execute('DESCRIBE id_card_persons');

        fs.writeFileSync('db_debug.json', JSON.stringify({ rows, fields }, null, 2));
        console.log('Results written to db_debug.json');
    } catch (err) {
        console.error(err);
    } finally {
        await con.end();
    }
}

checkData();
