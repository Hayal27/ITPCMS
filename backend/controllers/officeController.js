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

// --- Office Building Handlers ---

// Get all buildings
exports.getBuildings = async (req, res) => {
    try {
        const buildings = await query('SELECT * FROM office_buildings ORDER BY name ASC');
        res.status(200).json(buildings);
    } catch (error) {
        console.error('Error fetching buildings:', error);
        res.status(500).json({ message: 'Error fetching buildings', error: error.message });
    }
};

// Create a new building
exports.createBuilding = async (req, res) => {
    try {
        const { name, description, total_offices, available_offices, total_size_sqm, icon_name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Please provide building name' });
        }

        const result = await query(
            'INSERT INTO office_buildings (name, description, total_offices, available_offices, total_size_sqm, icon_name) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, total_offices || 0, available_offices || 0, total_size_sqm || 0, icon_name || 'FaBuilding']
        );

        res.status(201).json({ message: 'Building created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating building:', error);
        res.status(500).json({ message: 'Error creating building', error: error.message });
    }
};

// Update a building
exports.updateBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, total_offices, available_offices, total_size_sqm, icon_name } = req.body;

        await query(
            'UPDATE office_buildings SET name = ?, description = ?, total_offices = ?, available_offices = ?, total_size_sqm = ?, icon_name = ? WHERE id = ?',
            [name, description, total_offices, available_offices, total_size_sqm, icon_name, id]
        );

        res.status(200).json({ message: 'Building updated successfully' });
    } catch (error) {
        console.error('Error updating building:', error);
        res.status(500).json({ message: 'Error updating building', error: error.message });
    }
};

// Delete a building
exports.deleteBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM office_buildings WHERE id = ?', [id]);
        res.status(200).json({ message: 'Building deleted successfully' });
    } catch (error) {
        console.error('Error deleting building:', error);
        res.status(500).json({ message: 'Error deleting building', error: error.message });
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
        console.error('Error fetching offices:', error);
        res.status(500).json({ message: 'Error fetching offices', error: error.message });
    }
};

// Create a new office
exports.createOffice = async (req, res) => {
    try {
        const { id, zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone } = req.body;

        if (!id || !zone || !building_id || !unit_number || !floor || !size_sqm || !price_monthly || !contact_name || !contact_phone) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        await query(
            'INSERT INTO offices (id, zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, zone, building_id, unit_number, floor, size_sqm, status || 'Available', price_monthly, rented_by, available_from, contact_name, contact_phone]
        );

        res.status(201).json({ message: 'Office created successfully', id });
    } catch (error) {
        console.error('Error creating office:', error);
        res.status(500).json({ message: 'Error creating office', error: error.message });
    }
};

// Update an office
exports.updateOffice = async (req, res) => {
    try {
        const { id } = req.params;
        const { zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone } = req.body;

        await query(
            'UPDATE offices SET zone = ?, building_id = ?, unit_number = ?, floor = ?, size_sqm = ?, status = ?, price_monthly = ?, rented_by = ?, available_from = ?, contact_name = ?, contact_phone = ? WHERE id = ?',
            [zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone, id]
        );

        res.status(200).json({ message: 'Office updated successfully' });
    } catch (error) {
        console.error('Error updating office:', error);
        res.status(500).json({ message: 'Error updating office', error: error.message });
    }
};

// Delete an office
exports.deleteOffice = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM offices WHERE id = ?', [id]);
        res.status(200).json({ message: 'Office deleted successfully' });
    } catch (error) {
        console.error('Error deleting office:', error);
        res.status(500).json({ message: 'Error deleting office', error: error.message });
    }
};
