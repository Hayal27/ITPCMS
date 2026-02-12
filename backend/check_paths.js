const mysql = require('mysql2/promise');

async function checkData() {
    const con = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cms_up'
    });

    try {
        const [news] = await con.execute('SELECT image FROM newsf LIMIT 5');
        console.log('News Images:', JSON.stringify(news, null, 2));

        const [media] = await con.execute('SELECT src FROM media LIMIT 5');
        console.log('Media Src:', JSON.stringify(media, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await con.end();
    }
}

checkData();
