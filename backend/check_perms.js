const db = require('./models/db');

async function checkMenu() {
    try {
        const [rows] = await db.promise().query("SELECT id, title, path FROM cms_menus WHERE path LIKE '%investor%'");
        console.log("MENUS_START");
        console.log(JSON.stringify(rows));
        console.log("MENUS_END");

        if (rows.length > 0) {
            const menuId = rows[0].id;
            const [rolePerms] = await db.promise().query("SELECT * FROM role_menu_permissions WHERE menu_id = ?", [menuId]);
            console.log("ROLE_PERMS_START");
            console.log(JSON.stringify(rolePerms));
            console.log("ROLE_PERMS_END");

            const [userPerms] = await db.promise().query("SELECT * FROM user_menu_permissions WHERE menu_id = ?", [menuId]);
            console.log("USER_PERMS_START");
            console.log(JSON.stringify(userPerms));
            console.log("USER_PERMS_END");
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkMenu();
