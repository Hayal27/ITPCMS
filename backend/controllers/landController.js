const db = require('../models/db');
const validator = require('validator');
const crypto = require('crypto');
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
    console.error(`[LAND SECURITY] Error:`, error);
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

// --- Land Zone Handlers ---

// Get all land zones
exports.getLandZones = async (req, res) => {
    try {
        const zones = await query('SELECT * FROM land_zones ORDER BY name ASC');
        res.status(200).json(zones);
    } catch (error) {
        sendError(res, error);
    }
};

// Create a new land zone
exports.createLandZone = async (req, res) => {
    try {
        let { name, description, total_size_sqm, available_size_sqm, icon_name } = req.body;

        name = cleanString(name);
        if (!name) return res.status(400).json({ message: 'Please provide zone name' });

        description = cleanString(description || '');
        icon_name = cleanString(icon_name || 'FaGlobeAfrica');

        const result = await query(
            'INSERT INTO land_zones (name, description, total_size_sqm, available_size_sqm, icon_name) VALUES (?, ?, ?, ?, ?)',
            [name, description, total_size_sqm || 0, available_size_sqm || 0, icon_name]
        );

        res.status(201).json({ message: 'Land zone created successfully', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

// Update a land zone
exports.updateLandZone = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: 'Invalid Zone ID' });

        let { name, description, total_size_sqm, available_size_sqm, icon_name } = req.body;

        name = cleanString(name);
        if (!name) return res.status(400).json({ message: 'Zone name is required' });

        description = cleanString(description || '');
        icon_name = cleanString(icon_name || 'FaGlobeAfrica');

        await query(
            'UPDATE land_zones SET name = ?, description = ?, total_size_sqm = ?, available_size_sqm = ?, icon_name = ? WHERE id = ?',
            [name, description, total_size_sqm, available_size_sqm, icon_name, id]
        );

        res.status(200).json({ message: 'Land zone updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// Delete a land zone
exports.deleteLandZone = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: 'Invalid Zone ID' });

        await query('DELETE FROM land_zones WHERE id = ?', [id]);
        res.status(200).json({ message: 'Land zone deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// --- Leased Land Handlers ---

// Get all leased lands with zone details
exports.getLeasedLands = async (req, res) => {
    try {
        const sql = `
            SELECT l.*, z.name as zone_name 
            FROM leased_lands l 
            JOIN land_zones z ON l.zone_id = z.id 
            ORDER BY l.created_at DESC
        `;
        const lands = await query(sql);
        res.status(200).json(lands);
    } catch (error) {
        sendError(res, error);
    }
};

// Create a new leased land parcel
exports.createLeasedLand = async (req, res) => {
    try {
        let { zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, leased_from, contact_name, contact_phone } = req.body;

        // Sanitization
        land_type = cleanString(land_type);
        location = cleanString(location);
        status = cleanString(status || 'Available');
        leased_by = cleanString(leased_by || '');
        contact_name = cleanString(contact_name);
        contact_phone = cleanString(contact_phone);

        // Validation - Allow 0 for numeric fields, but require presence
        const requiredFields = { zone_id, land_type, location, size_sqm, contact_name, contact_phone };
        const missing = Object.entries(requiredFields)
            .filter(([k, v]) => v === undefined || v === null || v.toString().trim() === '')
            .map(([k, v]) => k);

        if (missing.length > 0) {
            console.error('❌ Validation Failed. Missing fields:', missing, 'Received:', req.body);
            return res.status(400).json({
                message: 'Please provide all required fields',
                missing: missing
            });
        }

        // Ensure numeric types
        zone_id = parseInt(zone_id, 10);
        size_sqm = parseFloat(size_sqm);
        available_size_sqm = available_size_sqm ? parseFloat(available_size_sqm) : 0;

        if (isNaN(zone_id) || isNaN(size_sqm)) {
            return res.status(400).json({ message: 'Invalid numeric data provided' });
        }

        // Auto-generate ID: Pattern LND-XXXX (Hex)
        const id = `LND-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Handle empty date (tolerant of non-string values)
        const validLeasedFrom = (leased_from && leased_from.toString().trim() !== '') ? leased_from : null;

        await query(
            'INSERT INTO leased_lands (id, zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, leased_from, contact_name, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, validLeasedFrom, contact_name, contact_phone]
        );

        res.status(201).json({ message: 'Leased land created successfully', id });
    } catch (error) {
        sendError(res, error);
    }
};

// Update a leased land parcel
exports.updateLeasedLand = async (req, res) => {
    try {
        const id = cleanString(req.params.id);
        if (!id) return res.status(400).json({ message: 'Invalid Land ID' });

        let { zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, leased_from, contact_name, contact_phone } = req.body;

        // Sanitization
        land_type = cleanString(land_type);
        location = cleanString(location);
        status = cleanString(status || 'Available');
        leased_by = cleanString(leased_by || '');
        contact_name = cleanString(contact_name);
        contact_phone = cleanString(contact_phone);

        // Strict Validation
        const requiredFields = { zone_id, land_type, location, size_sqm, contact_name, contact_phone };
        const missing = Object.entries(requiredFields)
            .filter(([k, v]) => v === undefined || v === null || v.toString().trim() === '')
            .map(([k, v]) => k);

        if (missing.length > 0) {
            console.error('❌ Update Validation Failed. Missing fields:', missing, 'Received:', req.body);
            return res.status(400).json({
                message: 'Please provide all required fields',
                missing: missing
            });
        }

        // Ensure numeric types
        zone_id = parseInt(zone_id, 10);
        size_sqm = parseFloat(size_sqm);
        available_size_sqm = available_size_sqm ? parseFloat(available_size_sqm) : 0;

        if (isNaN(zone_id) || isNaN(size_sqm)) {
            return res.status(400).json({ message: 'Invalid numeric data provided' });
        }

        // Handle empty date
        const validLeasedFrom = (leased_from && leased_from.toString().trim() !== '') ? leased_from : null;

        await query(
            'UPDATE leased_lands SET zone_id = ?, land_type = ?, location = ?, size_sqm = ?, available_size_sqm = ?, status = ?, leased_by = ?, leased_from = ?, contact_name = ?, contact_phone = ? WHERE id = ?',
            [zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, validLeasedFrom, contact_name, contact_phone, id]
        );

        res.status(200).json({ message: 'Leased land updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// Delete a leased land parcel
exports.deleteLeasedLand = async (req, res) => {
    try {
        const id = cleanString(req.params.id);
        if (!id) return res.status(400).json({ message: 'Invalid Land ID' });

        await query('DELETE FROM leased_lands WHERE id = ?', [id]);
        res.status(200).json({ message: 'Leased land deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};
