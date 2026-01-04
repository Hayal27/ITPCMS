const db = require('../models/db');

// --- MENU MANAGEMENT ---

exports.getAllMenus = async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM cms_menus ORDER BY order_index ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createMenu = async (req, res) => {
    const { title, path, icon, color, parent_id, order_index, is_section, is_dropdown } = req.body;
    try {
        const [result] = await db.promise().query(
            'INSERT INTO cms_menus (title, path, icon, color, parent_id, order_index, is_section, is_dropdown) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, path, icon, color, parent_id || null, order_index || 0, is_section ? 1 : 0, is_dropdown ? 1 : 0]
        );
        res.json({ success: true, data: { id: result.insertId, ...req.body } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateMenu = async (req, res) => {
    const { id } = req.params;
    const { title, path, icon, color, parent_id, order_index, is_section, is_dropdown, is_active } = req.body;
    try {
        await db.promise().query(
            'UPDATE cms_menus SET title = ?, path = ?, icon = ?, color = ?, parent_id = ?, order_index = ?, is_section = ?, is_dropdown = ?, is_active = ? WHERE id = ?',
            [title, path, icon, color, parent_id || null, order_index || 0, is_section ? 1 : 0, is_dropdown ? 1 : 0, is_active ? 1 : 0, id]
        );
        res.json({ success: true, message: 'Menu updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteMenu = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query('DELETE FROM cms_menus WHERE id = ?', [id]);
        res.json({ success: true, message: 'Menu deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- PERMISSIONS ---

exports.getRolePermissions = async (req, res) => {
    const { role_id } = req.params;
    try {
        const [rows] = await db.promise().query('SELECT menu_id FROM role_menu_permissions WHERE role_id = ?', [role_id]);
        res.json({ success: true, data: rows.map(r => r.menu_id) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRolePermissions = async (req, res) => {
    const { role_id } = req.params;
    const { menu_ids } = req.body; // Array of menu IDs

    // Use a transaction
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        // Remove existing
        await connection.query('DELETE FROM role_menu_permissions WHERE role_id = ?', [role_id]);

        // Add new
        if (menu_ids && menu_ids.length > 0) {
            const values = menu_ids.map(menu_id => [role_id, menu_id]);
            await connection.query('INSERT INTO role_menu_permissions (role_id, menu_id) VALUES ?', [values]);
        }

        await connection.commit();
        res.json({ success: true, message: 'Permissions updated successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

exports.getUserPermissions = async (req, res) => {
    const { user_id } = req.params;
    try {
        const [rows] = await db.promise().query('SELECT menu_id, permission_type FROM user_menu_permissions WHERE user_id = ?', [user_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserPermissions = async (req, res) => {
    const { user_id } = req.params;
    const { permissions } = req.body; // Array of { menu_id, permission_type }

    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM user_menu_permissions WHERE user_id = ?', [user_id]);

        if (permissions && permissions.length > 0) {
            const values = permissions.map(p => [user_id, p.menu_id, p.permission_type]);
            await connection.query('INSERT INTO user_menu_permissions (user_id, menu_id, permission_type) VALUES ?', [values]);
        }

        await connection.commit();
        res.json({ success: true, message: 'User permissions updated successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

// --- GET ENTIRE NAV FOR LOGGED IN USER ---
exports.getUserNavigation = async (req, res) => {
    const userId = req.user.user_id;
    const roleId = req.user.role_id;

    try {
        // 1. Get all menus
        const [allMenus] = await db.promise().query('SELECT * FROM cms_menus WHERE is_active = 1 ORDER BY order_index ASC');

        // Admin Bypass: Role 1 gets to see everything regardless of permissions table
        if (roleId === 1) {
            res.json({ success: true, data: allMenus });
            return;
        }

        // 2. Get role permissions
        const [rolePerms] = await db.promise().query('SELECT menu_id FROM role_menu_permissions WHERE role_id = ?', [roleId]);
        const allowedByRole = new Set(rolePerms.map(p => p.menu_id));

        // 3. Get user overrides
        const [userPerms] = await db.promise().query('SELECT menu_id, permission_type FROM user_menu_permissions WHERE user_id = ?', [userId]);

        const finalAllowedIds = new Set(allowedByRole);
        userPerms.forEach(p => {
            if (p.permission_type === 'allow') {
                finalAllowedIds.add(p.menu_id);
            } else {
                finalAllowedIds.delete(p.menu_id);
            }
        });

        // 4. Construct tree (Ensure parents are included)
        // If a child is permitted, its parents must be visible for the tree to render
        const menuMap = new Map();
        allMenus.forEach(m => menuMap.set(m.id, m));

        const resultIds = new Set();

        allMenus.forEach(m => {
            if (finalAllowedIds.has(m.id)) {
                resultIds.add(m.id);
                // Walk up the tree to add ancestors
                let curr = m;
                while (curr.parent_id) {
                    const parent = menuMap.get(curr.parent_id);
                    // If parent exists and isn't already added (optimization to stop walking if we hit a known active branch)
                    if (parent) {
                        if (!resultIds.has(parent.id)) {
                            resultIds.add(parent.id);
                            curr = parent;
                        } else {
                            break; // Parent already added, so ancestors must be added too
                        }
                    } else {
                        break; // Parent ID invalid or not in active menus
                    }
                }
            }
        });

        const permittedMenus = allMenus.filter(m => resultIds.has(m.id));
        console.log(`[DEBUG] Found ${permittedMenus.length} permitted menus for user ${userId}, role ${roleId}`);

        res.json({ success: true, data: permittedMenus });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
