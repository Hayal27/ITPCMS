const db = require('../models/db');

// Manual promise wrapper
const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// --- Land Zone Handlers ---

// Get all land zones
exports.getLandZones = async (req, res) => {
    try {
        const zones = await query('SELECT * FROM land_zones ORDER BY name ASC');
        res.status(200).json(zones);
    } catch (error) {
        console.error('Error fetching land zones:', error);
        res.status(500).json({ message: 'Error fetching land zones', error: error.message });
    }
};

// Create a new land zone
exports.createLandZone = async (req, res) => {
    try {
        const { name, description, total_size_sqm, available_size_sqm, icon_name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Please provide zone name' });
        }

        const result = await query(
            'INSERT INTO land_zones (name, description, total_size_sqm, available_size_sqm, icon_name) VALUES (?, ?, ?, ?, ?)',
            [name, description, total_size_sqm || 0, available_size_sqm || 0, icon_name || 'FaGlobeAfrica']
        );

        res.status(201).json({ message: 'Land zone created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating land zone:', error);
        res.status(500).json({ message: 'Error creating land zone', error: error.message });
    }
};

// Update a land zone
exports.updateLandZone = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, total_size_sqm, available_size_sqm, icon_name } = req.body;

        await query(
            'UPDATE land_zones SET name = ?, description = ?, total_size_sqm = ?, available_size_sqm = ?, icon_name = ? WHERE id = ?',
            [name, description, total_size_sqm, available_size_sqm, icon_name, id]
        );

        res.status(200).json({ message: 'Land zone updated successfully' });
    } catch (error) {
        console.error('Error updating land zone:', error);
        res.status(500).json({ message: 'Error updating land zone', error: error.message });
    }
};

// Delete a land zone
exports.deleteLandZone = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM land_zones WHERE id = ?', [id]);
        res.status(200).json({ message: 'Land zone deleted successfully' });
    } catch (error) {
        console.error('Error deleting land zone:', error);
        res.status(500).json({ message: 'Error deleting land zone', error: error.message });
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
        console.error('Error fetching leased lands:', error);
        res.status(500).json({ message: 'Error fetching leased lands', error: error.message });
    }
};

// Create a new leased land parcel
exports.createLeasedLand = async (req, res) => {
    try {
        const { id, zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, leased_from, contact_name, contact_phone } = req.body;

        if (!id || !zone_id || !land_type || !location || !size_sqm || !contact_name || !contact_phone) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        await query(
            'INSERT INTO leased_lands (id, zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, leased_from, contact_name, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, zone_id, land_type, location, size_sqm, available_size_sqm || 0, status || 'Available', leased_by, leased_from, contact_name, contact_phone]
        );

        res.status(201).json({ message: 'Leased land created successfully', id });
    } catch (error) {
        console.error('Error creating leased land:', error);
        res.status(500).json({ message: 'Error creating leased land', error: error.message });
    }
};

// Update a leased land parcel
exports.updateLeasedLand = async (req, res) => {
    try {
        const { id } = req.params;
        const { zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, leased_from, contact_name, contact_phone } = req.body;

        await query(
            'UPDATE leased_lands SET zone_id = ?, land_type = ?, location = ?, size_sqm = ?, available_size_sqm = ?, status = ?, leased_by = ?, leased_from = ?, contact_name = ?, contact_phone = ? WHERE id = ?',
            [zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, leased_from, contact_name, contact_phone, id]
        );

        res.status(200).json({ message: 'Leased land updated successfully' });
    } catch (error) {
        console.error('Error updating leased land:', error);
        res.status(500).json({ message: 'Error updating leased land', error: error.message });
    }
};

// Delete a leased land parcel
exports.deleteLeasedLand = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM leased_lands WHERE id = ?', [id]);
        res.status(200).json({ message: 'Leased land deleted successfully' });
    } catch (error) {
        console.error('Error deleting leased land:', error);
        res.status(500).json({ message: 'Error deleting leased land', error: error.message });
    }
};
