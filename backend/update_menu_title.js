const db = require('./models/db');
db.promise().query("UPDATE cms_menus SET title = 'Roles & Permissions' WHERE title = 'Roles'")
    .then(() => { console.log('Updated Menu Title'); process.exit(0); })
    .catch(err => { console.error(err); process.exit(1); });
