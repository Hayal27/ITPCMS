const db = require('../models/db');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Manual promise wrapper
const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Security Utilities
const sendError = (res, error, status = 500) => {
    console.error(`[OFFICE SECURITY] Error:`, error);
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'A secure processing error occurred. Detailed logs are available to admins.'
            : error.message
    });
};

const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).trim();
};

// --- Office Building Handlers ---

// Get all buildings
exports.getBuildings = async (req, res) => {
    try {
        const buildings = await query('SELECT * FROM office_buildings ORDER BY name ASC');
        res.status(200).json(buildings);
    } catch (error) {
        sendError(res, error);
    }
};

// Create a new building
exports.createBuilding = async (req, res) => {
    try {
        let { name, description, total_offices, available_offices, total_size_sqm, icon_name } = req.body;

        name = cleanString(name);

        if (!name) {
            return res.status(400).json({ message: 'Please provide building name' });
        }

        description = cleanString(description);
        icon_name = cleanString(icon_name) || 'FaBuilding';

        const result = await query(
            'INSERT INTO office_buildings (name, description, total_offices, available_offices, total_size_sqm, icon_name) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, total_offices || 0, available_offices || 0, total_size_sqm || 0, icon_name]
        );

        res.status(201).json({ message: 'Building created successfully', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

// Update a building
exports.updateBuilding = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: 'Invalid Building ID' });

        let { name, description, total_offices, available_offices, total_size_sqm, icon_name } = req.body;

        name = cleanString(name);
        if (!name) return res.status(400).json({ message: 'Building name is required' });

        description = cleanString(description);
        icon_name = cleanString(icon_name);

        await query(
            'UPDATE office_buildings SET name = ?, description = ?, total_offices = ?, available_offices = ?, total_size_sqm = ?, icon_name = ? WHERE id = ?',
            [name, description, total_offices, available_offices, total_size_sqm, icon_name, id]
        );

        res.status(200).json({ message: 'Building updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// Delete a building
exports.deleteBuilding = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: 'Invalid Building ID' });

        await query('DELETE FROM office_buildings WHERE id = ?', [id]);
        res.status(200).json({ message: 'Building deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// --- Office Handlers ---

// Get all offices with building details
exports.getOffices = async (req, res) => {
    try {
        const sql = `
            SELECT o.*, b.name as building_name 
            FROM offices o 
            JOIN office_buildings b ON o.building_id = b.id 
            ORDER BY o.created_at DESC
        `;
        const offices = await query(sql);
        res.status(200).json(offices);
    } catch (error) {
        sendError(res, error);
    }
};

// Create a new office
exports.createOffice = async (req, res) => {
    try {
        let { id, zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone } = req.body;

        // Sanitize strings
        id = cleanString(id);
        zone = cleanString(zone);
        unit_number = cleanString(unit_number);
        status = cleanString(status) || 'Available';
        rented_by = cleanString(rented_by);
        contact_name = cleanString(contact_name);
        contact_phone = cleanString(contact_phone);

        // Basic validation
        if (!id || !zone || !building_id || !unit_number || !floor || !size_sqm || !price_monthly || !contact_name || !contact_phone) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Ensure numeric fields are numbers
        building_id = parseInt(building_id, 10);
        floor = parseInt(floor, 10);
        size_sqm = parseFloat(size_sqm);
        price_monthly = parseFloat(price_monthly);

        await query(
            'INSERT INTO offices (id, zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone]
        );

        res.status(201).json({ message: 'Office created successfully', id });
    } catch (error) {
        sendError(res, error);
    }
};

// Update an office
exports.updateOffice = async (req, res) => {
    try {
        const id = cleanString(req.params.id);
        if (!id) return res.status(400).json({ message: 'Invalid Office ID' });

        let { zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone } = req.body;

        zone = cleanString(zone);
        unit_number = cleanString(unit_number);
        status = cleanString(status);
        rented_by = cleanString(rented_by);
        contact_name = cleanString(contact_name);
        contact_phone = cleanString(contact_phone);

        building_id = parseInt(building_id, 10);
        floor = parseInt(floor, 10);

        await query(
            'UPDATE offices SET zone = ?, building_id = ?, unit_number = ?, floor = ?, size_sqm = ?, status = ?, price_monthly = ?, rented_by = ?, available_from = ?, contact_name = ?, contact_phone = ? WHERE id = ?',
            [zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone, id]
        );

        res.status(200).json({ message: 'Office updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// Delete an office
exports.deleteOffice = async (req, res) => {
    try {
        const id = cleanString(req.params.id);
        if (!id) return res.status(400).json({ message: 'Invalid Office ID' });

        await query('DELETE FROM offices WHERE id = ?', [id]);
        res.status(200).json({ message: 'Office deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};
