const con = require('../models/db');
const crypto = require('crypto');
const validator = require('validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Encryption Settings
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.SESSION_SECRET).digest();
const IV_LENGTH = 16;

function encryptId(text) {
    if (!text) return null;
    try {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text.toString());
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (e) {
        console.error("Encryption error:", e);
        return text;
    }
}

function decryptId(text) {
    if (!text) return text;
    try {
        let textParts = text.split(':');
        if (textParts.length < 2) return text; // Not encrypted format
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        return text; // Return original if decryption fails (fallback for plain IDs)
    }
}

// Security Utility: Strip ALL HTML tags
const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).trim();
};

// Helper: Sanitize person object to prevent XSS/HTML Injection
const sanitizePerson = (p) => {
    return {
        ...p,
        fname: cleanString(p.fname),
        lname: cleanString(p.lname),
        fname_am: cleanString(p.fname_am),
        lname_am: cleanString(p.lname_am),
        position: cleanString(p.position),
        position_am: cleanString(p.position_am),
        department: cleanString(p.department),
        nationality: cleanString(p.nationality),
        // Email should be validated and cleaned
        email: p.email ? validator.normalizeEmail(p.email) : p.email,
        phone: cleanString(p.phone),
        // Custom fields
        custom_field_1_label: cleanString(p.custom_field_1_label),
        custom_field_1_value: cleanString(p.custom_field_1_value),
        custom_field_2_label: cleanString(p.custom_field_2_label),
        custom_field_2_value: cleanString(p.custom_field_2_value),

        photo_url: p.photo_url // Trusted or should be URLs
    };
};

// Get all ID card persons
exports.getAllIdCardPersons = async (req, res) => {
    try {
        const [rows] = await con.promise().query('SELECT * FROM id_card_persons ORDER BY created_at DESC');
        const data = rows.map(row => ({
            ...row,
            encrypted_id: encryptId(row.id_number)
        }));
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching ID card persons:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching data' });
    }
};

// Get single ID card person by ID number (Public Verification)
exports.getPublicIdCardPerson = async (req, res) => {
    let { idNumber } = req.params;
    try {
        // Try to decrypt ID (if it's an encrypted string)
        const decrypted = decryptId(idNumber);
        if (decrypted) idNumber = decrypted;

        const [rows] = await con.promise().query('SELECT * FROM id_card_persons WHERE id_number = ?', [idNumber]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching public ID card person:', error);
        res.status(500).json({ success: false, message: 'Internal server error while retrieving person details' });
    }
};

// Add single ID card person
exports.addIdCardPerson = async (req, res) => {
    // 1. Sanitize Input
    const cleanData = sanitizePerson(req.body);

    // Deconstruct from safe data
    const {
        fname, lname, position, department, nationality, email, phone, sex,
        photo_url, id_number, fname_am, lname_am, position_am
    } = cleanData;

    try {
        let finalIdNumber = id_number;

        // Auto-generate ID number if not provided
        if (!finalIdNumber) {
            const [lastRecord] = await con.promise().query(
                'SELECT id_number FROM id_card_persons WHERE id_number REGEXP "^[0-9]+$" ORDER BY LENGTH(id_number) DESC, id_number DESC LIMIT 1'
            );

            let nextId = 1010001; // New base starting from 1,010,001
            if (lastRecord.length > 0) {
                const lastId = parseInt(lastRecord[0].id_number);
                if (lastId < 100000) {
                    // If we are in the lower range, increment but stay below/at 100,000
                    nextId = Math.min(100000, lastId + 1);
                    // If we just hit 100,000, or the next one would exceed it, we should jump to 1010001 in next call
                    // For now, if it was already 100k, jump
                    if (lastId >= 100000) nextId = 1010001;
                } else {
                    // If we are above 100,000, ensure we start at or above 1,010,001
                    nextId = Math.max(1010001, lastId + 1);
                }
            }
            finalIdNumber = nextId.toString();
        }

        const currentDate = new Date();
        const dateOfIssue = currentDate.toISOString().split('T')[0];
        const expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0];

        const [result] = await con.promise().query(
            `INSERT INTO id_card_persons 
            (fname, lname, position, department, nationality, email, phone, sex, photo_url, id_number, fname_am, lname_am, position_am, date_of_issue, expiry_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fname, lname, position, department, nationality, email, phone, sex, photo_url, finalIdNumber, fname_am, lname_am, position_am, dateOfIssue, expiryDate]
        );

        res.json({ success: true, message: 'Person added successfully', id: result.insertId, id_number: finalIdNumber });
    } catch (error) {
        console.error('Error adding ID card person:', error);
        res.status(500).json({ success: false, message: 'Internal server error while adding person' });
    }
};

// Add multiple ID card persons (batch)
exports.batchAddIdCardPersons = async (req, res) => {
    const { persons } = req.body;
    if (!persons || !Array.isArray(persons)) {
        return res.status(400).json({ success: false, message: 'Invalid persons data' });
    }

    try {
        // Sanitize all persons
        const cleanPersons = persons.map(p => sanitizePerson(p));

        // Get last ID number to auto-increment from there
        const [lastRecord] = await con.promise().query(
            'SELECT id_number FROM id_card_persons WHERE id_number REGEXP "^[0-9]+$" ORDER BY LENGTH(id_number) DESC, id_number DESC LIMIT 1'
        );

        let nextId = 1010001;
        if (lastRecord.length > 0) {
            const lastId = parseInt(lastRecord[0].id_number);
            if (lastId < 100000) {
                nextId = lastId + 1;
            } else {
                nextId = Math.max(1010001, lastId + 1);
            }
        }

        const currentDate = new Date();
        const dateOfIssue = currentDate.toISOString().split('T')[0];
        const expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0];

        const values = cleanPersons.map((p, index) => [
            p.fname, p.lname, p.position, p.department, p.nationality, p.email, p.phone, p.sex,
            p.photo_url, (nextId + index).toString(), p.fname_am, p.lname_am, p.position_am,
            dateOfIssue, expiryDate
        ]);

        await con.promise().query(
            `INSERT INTO id_card_persons 
            (fname, lname, position, department, nationality, email, phone, sex, photo_url, id_number, fname_am, lname_am, position_am, date_of_issue, expiry_date) 
            VALUES ?`,
            [values]
        );

        res.json({ success: true, message: `Successfully imported ${persons.length} persons` });
    } catch (error) {
        console.error('Error batch adding ID card persons:', error);
        res.status(500).json({ success: false, message: 'Internal server error during batch operation' });
    }
};

// Update ID card person
exports.updateIdCardPerson = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'No data provided for update' });
        }

        // Whitelist allowed columns to prevent SQL Injection via keys
        const ALLOWED_COLUMNS = [
            'fname', 'lname', 'position', 'department', 'nationality', 'email', 'phone', 'sex',
            'photo_url', 'id_number', 'fname_am', 'lname_am', 'position_am',
            'date_of_birth', 'date_of_issue', 'expiry_date', 'status', 'notes',
            'custom_field_1_label', 'custom_field_1_value',
            'custom_field_2_label', 'custom_field_2_value',
            'custom_field_3_label', 'custom_field_3_value'
        ];

        // Filter and Sanitize updates
        const filteredUpdate = {};
        Object.keys(updateData).forEach(key => {
            if (ALLOWED_COLUMNS.includes(key)) {
                let val = updateData[key];
                if (typeof val === 'string') {
                    if (key === 'email') {
                        val = validator.normalizeEmail(val);
                    } else if (key === 'photo_url') {
                        // Trust photo_url or minimally clean it (cleanString strips too much for URLs sometimes if aggressive, 
                        // but here we just want to trim usually. cleanString checks for allowed tags=[]. 
                        // URLs don't have tags, so cleanString is actually fine for URLs unless they have < >.
                        val = val.trim();
                    } else {
                        // Use cleanString instead of validator.escape for consistency
                        val = cleanString(val);
                    }
                }
                filteredUpdate[key] = val;
            }
        });

        if (Object.keys(filteredUpdate).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
        }

        const fields = Object.keys(filteredUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(filteredUpdate), id];

        await con.promise().query(
            `UPDATE id_card_persons SET ${fields} WHERE id = ?`,
            values
        );

        res.json({ success: true, message: 'ID card person updated successfully' });
    } catch (error) {
        console.error('Error updating ID card person:', error);
        res.status(500).json({ success: false, message: 'Internal server error while updating record' });
    }
};

// Delete ID card person
exports.deleteIdCardPerson = async (req, res) => {
    const { id } = req.params;

    try {
        await con.promise().query('DELETE FROM id_card_persons WHERE id = ?', [id]);
        res.json({ success: true, message: 'ID card person deleted successfully' });
    } catch (error) {
        console.error('Error deleting ID card person:', error);
        res.status(500).json({ success: false, message: 'Internal server error while deleting record' });
    }
};

// --- Template Management ---

// Helper to sanitize config object
const sanitizeConfig = (config) => {
    if (!config || typeof config !== 'object') return config;
    const clean = { ...config };
    Object.keys(clean).forEach(key => {
        if (typeof clean[key] === 'string') {
            clean[key] = cleanString(clean[key]);
        } else if (typeof clean[key] === 'object' && clean[key] !== null) {
            if (Array.isArray(clean[key])) {
                clean[key] = clean[key].map(item => sanitizeConfig(item));
            } else {
                clean[key] = sanitizeConfig(clean[key]);
            }
        }
    });
    return clean;
};

exports.getAllIdTemplates = async (req, res) => {
    try {
        const [rows] = await con.promise().query('SELECT * FROM id_card_templates ORDER BY created_at DESC');
        const data = rows.map(r => ({
            ...r,
            config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config
        }));
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ success: false, message: 'Internal server error while fetching templates' });
    }
};

exports.saveIdTemplate = async (req, res) => {
    const { template_name, config } = req.body;
    try {
        if (!config || Object.keys(config).length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or empty configuration' });
        }

        // Sanitize
        const cleanName = cleanString(template_name);
        const cleanConfig = sanitizeConfig(config);

        const [result] = await con.promise().query(
            'INSERT INTO id_card_templates (template_name, config) VALUES (?, ?)',
            [cleanName, JSON.stringify(cleanConfig)]
        );
        res.json({ success: true, message: 'Template saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({ success: false, message: 'Internal server error while saving template' });
    }
};

exports.updateIdTemplate = async (req, res) => {
    const { id } = req.params;
    const { template_name, config } = req.body;

    console.log(`Attempting to update template ID: ${id}`, { template_name });

    try {
        if (!config || Object.keys(config).length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or empty configuration' });
        }

        // Sanitize
        const cleanName = cleanString(template_name);
        const cleanConfig = sanitizeConfig(config);

        const [result] = await con.promise().query(
            'UPDATE id_card_templates SET template_name = ?, config = ? WHERE id = ?',
            [cleanName, JSON.stringify(cleanConfig), id]
        );

        if (result.affectedRows === 0) {
            console.log(`Update failed: Template ID ${id} not found.`);
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        console.log(`Template ID ${id} updated successfully.`);
        res.json({ success: true, message: 'Template updated successfully' });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ success: false, message: 'Internal server error while updating template' });
    }
};
