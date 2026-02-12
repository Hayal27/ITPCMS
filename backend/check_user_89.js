const db = require('./models/db');

async function checkUser89() {
    const userId = 89;
    const roleId = 2;
    try {
        const [allMenus] = await db.promise().query('SELECT id, title, path FROM cms_menus WHERE is_active = 1');
        const [rolePerms] = await db.promise().query('SELECT menu_id FROM role_menu_permissions WHERE role_id = ?', [roleId]);
        const [userPerms] = await db.promise().query('SELECT menu_id, permission_type FROM user_menu_permissions WHERE user_id = ?', [userId]);

        console.log("USER 89 PERMISSIONS CHECK:");
        console.log("Role ID:", roleId);
        console.log("Role Permissions (Menu IDs):", rolePerms.map(p => p.menu_id));
        console.log("User Overrides:", userPerms);

        const investorMenu = allMenus.find(m => m.path === '/interaction/investor-inquiries');
        if (investorMenu) {
            console.log("Investor Inquiry Menu Found:", investorMenu);
            const hasRolePerm = rolePerms.some(p => p.menu_id === investorMenu.id);
            const userOverride = userPerms.find(p => p.menu_id === investorMenu.id);
            console.log("Has Role Permission?", hasRolePerm);
            console.log("User Override?", userOverride ? userOverride.permission_type : "None");
        } else {
            console.log("Investor Inquiry Menu NOT FOUND with path '/interaction/investor-inquiries'");
            console.log("All Menu Paths:");
            allMenus.forEach(m => console.log(`- ${m.path} (${m.title})`));
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkUser89();
