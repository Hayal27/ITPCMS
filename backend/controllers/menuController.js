const db = require('../models/db');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const validator = require('validator');

// Setup DOMPurify for sanitization (Stored XSS / HTML Injection prevention)
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Utility to sanitize string inputs
 * Removes all HTML tags to prevent XSS/Injection
 */
const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    // Strip ALL tags for menu fields (titles, paths, icons shouldn't have HTML)
    return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).trim();
};

const sendError = (res, error, status = 500) => {
    console.error(`[MENU SECURITY] Error:`, error);
    // Generic message to avoid leaking DB details in production
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'An internal security or processing error occurred'
            : error.message
    });
};

// --- MENU MANAGEMENT ---

exports.getAllMenus = async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM cms_menus ORDER BY order_index ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        sendError(res, error);
    }
};

exports.createMenu = async (req, res) => {
    let { title, path, icon, color, parent_id, order_index, is_section, is_dropdown } = req.body;

    // 1. Validation & Sanitization
    if (!title || validator.isEmpty(title)) {
        return res.status(400).json({ success: false, message: 'Menu title is required' });
    }

    title = cleanString(title);
    path = cleanString(path || '');
    icon = cleanString(icon || '');
    color = cleanString(color || '');

    // Numeric validation
    const orderIndexNum = parseInt(order_index, 10) || 0;
    const parentIdNum = parent_id ? parseInt(parent_id, 10) : null;

    try {
        const [result] = await db.promise().query(
            'INSERT INTO cms_menus (title, path, icon, color, parent_id, order_index, is_section, is_dropdown) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, path, icon, color, parentIdNum, orderIndexNum, is_section ? 1 : 0, is_dropdown ? 1 : 0]
        );
        res.json({
            success: true,
            data: {
                id: result.insertId,
                title, path, icon, color,
                parent_id: parentIdNum,
                order_index: orderIndexNum,
                is_section: !!is_section,
                is_dropdown: !!is_dropdown
            }
        });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateMenu = async (req, res) => {
    const { id } = req.params;
    let { title, path, icon, color, parent_id, order_index, is_section, is_dropdown, is_active } = req.body;

    // 1. ID Validation
    const menuIdNum = parseInt(id, 10);
    if (isNaN(menuIdNum)) return res.status(400).json({ success: false, message: 'Invalid Menu ID' });

    // 2. Data Sanitization
    title = cleanString(title || '');
    path = cleanString(path || '');
    icon = cleanString(icon || '');
    color = cleanString(color || '');

    const orderIndexNum = parseInt(order_index, 10) || 0;
    const parentIdNum = parent_id ? parseInt(parent_id, 10) : null;

    try {
        await db.promise().query(
            'UPDATE cms_menus SET title = ?, path = ?, icon = ?, color = ?, parent_id = ?, order_index = ?, is_section = ?, is_dropdown = ?, is_active = ? WHERE id = ?',
            [title, path, icon, color, parentIdNum, orderIndexNum, is_section ? 1 : 0, is_dropdown ? 1 : 0, is_active ? 1 : 0, menuIdNum]
        );
        res.json({ success: true, message: 'Menu updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteMenu = async (req, res) => {
    const { id } = req.params;
    const menuIdNum = parseInt(id, 10);
    if (isNaN(menuIdNum)) return res.status(400).json({ success: false, message: 'Invalid Menu ID' });

    try {
        await db.promise().query('DELETE FROM cms_menus WHERE id = ?', [menuIdNum]);
        res.json({ success: true, message: 'Menu deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// --- PERMISSIONS ---

exports.getRolePermissions = async (req, res) => {
    const { role_id } = req.params;
    const roleIdNum = parseInt(role_id, 10);
    if (isNaN(roleIdNum)) return res.status(400).json({ success: false, message: 'Invalid Role ID' });

    try {
        const [rows] = await db.promise().query('SELECT menu_id FROM role_menu_permissions WHERE role_id = ?', [roleIdNum]);
        res.json({ success: true, data: rows.map(r => r.menu_id) });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateRolePermissions = async (req, res) => {
    const { role_id } = req.params;
    const { menu_ids } = req.body; // Array of menu IDs

    const roleIdNum = parseInt(role_id, 10);
    if (isNaN(roleIdNum)) return res.status(400).json({ success: false, message: 'Invalid Role ID' });

    if (!Array.isArray(menu_ids)) {
        return res.status(400).json({ success: false, message: 'menu_ids must be an array' });
    }

    // Use a transaction
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        // Remove existing
        await connection.query('DELETE FROM role_menu_permissions WHERE role_id = ?', [roleIdNum]);

        // Add new (Sanitized to numbers)
        if (menu_ids.length > 0) {
            const values = menu_ids
                .filter(id => !isNaN(parseInt(id, 10)))
                .map(menu_id => [roleIdNum, parseInt(menu_id, 10)]);

            if (values.length > 0) {
                await connection.query('INSERT INTO role_menu_permissions (role_id, menu_id) VALUES ?', [values]);
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Permissions updated successfully' });
    } catch (error) {
        await connection.rollback();
        sendError(res, error);
    } finally {
        connection.release();
    }
};

exports.getUserPermissions = async (req, res) => {
    const { user_id } = req.params;
    const userIdNum = parseInt(user_id, 10);
    if (isNaN(userIdNum)) return res.status(400).json({ success: false, message: 'Invalid User ID' });

    try {
        const [rows] = await db.promise().query('SELECT menu_id, permission_type FROM user_menu_permissions WHERE user_id = ?', [userIdNum]);
        res.json({ success: true, data: rows });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateUserPermissions = async (req, res) => {
    const { user_id } = req.params;
    const { permissions } = req.body; // Array of { menu_id, permission_type }

    const userIdNum = parseInt(user_id, 10);
    if (isNaN(userIdNum)) return res.status(400).json({ success: false, message: 'Invalid User ID' });

    if (!Array.isArray(permissions)) {
        return res.status(400).json({ success: false, message: 'permissions must be an array' });
    }

    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM user_menu_permissions WHERE user_id = ?', [userIdNum]);

        if (permissions.length > 0) {
            const values = permissions
                .filter(p => p.menu_id && (p.permission_type === 'allow' || p.permission_type === 'deny'))
                .map(p => [userIdNum, parseInt(p.menu_id, 10), p.permission_type]);

            if (values.length > 0) {
                await connection.query('INSERT INTO user_menu_permissions (user_id, menu_id, permission_type) VALUES ?', [values]);
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'User permissions updated successfully' });
    } catch (error) {
        await connection.rollback();
        sendError(res, error);
    } finally {
        connection.release();
    }
};

// --- GET ENTIRE NAV FOR LOGGED IN USER ---
exports.getUserNavigation = async (req, res) => {
    // These come from verifyToken middleware which is reliable
    const userId = req.user.user_id;
    const roleId = req.user.role_id;

    try {
        // 1. Get all active menus (Parameterized query prevents SQLi)
        const [allMenus] = await db.promise().query('SELECT * FROM cms_menus WHERE is_active = 1 ORDER BY order_index ASC');

        // Admin Bypass: Role 1 gets to see everything
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
            } else if (p.permission_type === 'deny') {
                finalAllowedIds.delete(p.menu_id);
            }
        });

        // 4. Construct tree (Ensure parents are included)
        const menuMap = new Map();
        allMenus.forEach(m => menuMap.set(m.id, m));

        const resultIds = new Set();
        allMenus.forEach(m => {
            if (finalAllowedIds.has(m.id)) {
                resultIds.add(m.id);
                // Walk up the tree to add ancestors (Ensures parent visibility)
                let curr = m;
                while (curr.parent_id) {
                    const parent = menuMap.get(curr.parent_id);
                    if (parent && !resultIds.has(parent.id)) {
                        resultIds.add(parent.id);
                        curr = parent;
                    } else break;
                }
            }
        });

        const permittedMenus = allMenus.filter(m => resultIds.has(m.id));
        res.json({ success: true, data: permittedMenus });
    } catch (error) {
        sendError(res, error);
    }
};
