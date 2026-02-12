const con = require('./models/db');
con.query('DESCRIBE id_card_persons', (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
});
