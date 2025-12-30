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

// --- Partners ---

exports.getPartners = async (req, res) => {
    try {
        const partners = await query('SELECT * FROM partners ORDER BY created_at DESC');
        // Parse services_provided if it's stored as JSON
        const formattedPartners = partners.map(p => ({
            ...p,
            services_provided: p.services_provided ? JSON.parse(p.services_provided) : [],
            gallery: p.gallery ? JSON.parse(p.gallery) : []
        }));
        res.status(200).json(formattedPartners);
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ message: 'Error fetching partners', error: error.message });
    }
};

exports.createPartner = async (req, res) => {
    try {
        const {
            partner_id, company_name, contact_name, contact_email,
            partnership_type, country, zone, industry_type,
            agreement_start_date, agreement_end_date, status,
            services_provided, description,
            meta_title, meta_description, meta_keywords, slug,
            website, linkedin, twitter, facebook
        } = req.body;

        const logo = req.files?.logo ? `/uploads/partners-investors/${req.files.logo[0].filename}` : req.body.logo;
        const galleryFiles = req.files?.gallery ? req.files.gallery.map(f => `/uploads/partners-investors/${f.filename}`) : [];

        // In case services_provided comes as a string from FormData
        let parsedServices = services_provided;
        if (typeof services_provided === 'string') {
            try {
                parsedServices = JSON.parse(services_provided);
            } catch (e) {
                parsedServices = services_provided.split(',').map(s => s.trim());
            }
        }

        const result = await query(
            `INSERT INTO partners (
                partner_id, company_name, contact_name, contact_email, 
                partnership_type, country, zone, industry_type, 
                agreement_start_date, agreement_end_date, status, 
                services_provided, logo, description,
                meta_title, meta_description, meta_keywords, slug,
                website, linkedin, twitter, facebook, gallery
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                partner_id, company_name, contact_name, contact_email,
                partnership_type, country, zone, industry_type,
                agreement_start_date, agreement_end_date, status || 'Active',
                JSON.stringify(parsedServices || []), logo, description,
                meta_title, meta_description, meta_keywords, slug,
                website, linkedin, twitter, facebook,
                JSON.stringify(galleryFiles)
            ]
        );

        res.status(201).json({ message: 'Partner created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating partner:', error);
        res.status(500).json({ message: 'Error creating partner', error: error.message });
    }
};

exports.updatePartner = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            partner_id, company_name, contact_name, contact_email,
            partnership_type, country, zone, industry_type,
            agreement_start_date, agreement_end_date, status,
            services_provided, description,
            meta_title, meta_description, meta_keywords, slug,
            website, linkedin, twitter, facebook
        } = req.body;

        const logo = req.files?.logo ? `/uploads/partners-investors/${req.files.logo[0].filename}` : req.body.logo;
        let gallery = [];
        try {
            gallery = typeof req.body.gallery === 'string' ? JSON.parse(req.body.gallery) : (req.body.gallery || []);
        } catch (e) { gallery = []; }

        const newGalleryFiles = req.files?.gallery ? req.files.gallery.map(f => `/uploads/partners-investors/${f.filename}`) : [];
        const finalGallery = [...gallery, ...newGalleryFiles];

        let parsedServices = services_provided;
        if (typeof services_provided === 'string') {
            try {
                parsedServices = JSON.parse(services_provided);
            } catch (e) {
                parsedServices = services_provided.split(',').map(s => s.trim());
            }
        }

        await query(
            `UPDATE partners SET 
                partner_id = ?, company_name = ?, contact_name = ?, contact_email = ?, 
                partnership_type = ?, country = ?, zone = ?, industry_type = ?, 
                agreement_start_date = ?, agreement_end_date = ?, status = ?, 
                services_provided = ?, logo = ?, description = ?,
                meta_title = ?, meta_description = ?, meta_keywords = ?, slug = ?,
                website = ?, linkedin = ?, twitter = ?, facebook = ?, gallery = ?
            WHERE id = ?`,
            [
                partner_id, company_name, contact_name, contact_email,
                partnership_type, country, zone, industry_type,
                agreement_start_date, agreement_end_date, status,
                JSON.stringify(parsedServices || []), logo, description,
                meta_title, meta_description, meta_keywords, slug,
                website, linkedin, twitter, facebook, JSON.stringify(finalGallery),
                id
            ]
        );

        res.status(200).json({ message: 'Partner updated successfully' });
    } catch (error) {
        console.error('Error updating partner:', error);
        res.status(500).json({ message: 'Error updating partner', error: error.message });
    }
};

exports.deletePartner = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM partners WHERE id = ?', [id]);
        res.status(200).json({ message: 'Partner deleted successfully' });
    } catch (error) {
        console.error('Error deleting partner:', error);
        res.status(500).json({ message: 'Error deleting partner', error: error.message });
    }
};

// --- Investors ---

exports.getInvestors = async (req, res) => {
    try {
        const investors = await query('SELECT * FROM investors ORDER BY created_at DESC');
        const formattedInvestors = investors.map(i => ({
            ...i,
            gallery: i.gallery ? JSON.parse(i.gallery) : []
        }));
        res.status(200).json(formattedInvestors);
    } catch (error) {
        console.error('Error fetching investors:', error);
        res.status(500).json({ message: 'Error fetching investors', error: error.message });
    }
};

exports.createInvestor = async (req, res) => {
    try {
        const {
            investor_id, company_name, property_name, industry_type,
            availability_status, zone, country, description,
            contact_name, contact_phone, investment_type,
            established_date, website,
            meta_title, meta_description, meta_keywords, slug,
            linkedin, twitter, facebook
        } = req.body;

        const image = req.files?.image ? `/uploads/partners-investors/${req.files.image[0].filename}` : req.body.image;
        const galleryFiles = req.files?.gallery ? req.files.gallery.map(f => `/uploads/partners-investors/${f.filename}`) : [];

        const result = await query(
            `INSERT INTO investors (
                investor_id, company_name, property_name, industry_type, 
                availability_status, zone, country, description, 
                contact_name, contact_phone, investment_type, 
                established_date, website, image,
                meta_title, meta_description, meta_keywords, slug,
                linkedin, twitter, facebook, gallery
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                investor_id, company_name, property_name, industry_type,
                availability_status, zone, country, description,
                contact_name, contact_phone, investment_type,
                established_date, website, image,
                meta_title, meta_description, meta_keywords, slug,
                linkedin, twitter, facebook, JSON.stringify(galleryFiles)
            ]
        );

        res.status(201).json({ message: 'Investor created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating investor:', error);
        res.status(500).json({ message: 'Error creating investor', error: error.message });
    }
};

exports.updateInvestor = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            investor_id, company_name, property_name, industry_type,
            availability_status, zone, country, description,
            contact_name, contact_phone, investment_type,
            established_date, website,
            meta_title, meta_description, meta_keywords, slug,
            linkedin, twitter, facebook
        } = req.body;

        const image = req.files?.image ? `/uploads/partners-investors/${req.files.image[0].filename}` : req.body.image;
        let gallery = [];
        try {
            gallery = typeof req.body.gallery === 'string' ? JSON.parse(req.body.gallery) : (req.body.gallery || []);
        } catch (e) { gallery = []; }

        const newGalleryFiles = req.files?.gallery ? req.files.gallery.map(f => `/uploads/partners-investors/${f.filename}`) : [];
        const finalGallery = [...gallery, ...newGalleryFiles];

        await query(
            `UPDATE investors SET 
                investor_id = ?, company_name = ?, property_name = ?, industry_type = ?, 
                availability_status = ?, zone = ?, country = ?, description = ?, 
                contact_name = ?, contact_phone = ?, investment_type = ?, 
                established_date = ?, website = ?, image = ?,
                meta_title = ?, meta_description = ?, meta_keywords = ?, slug = ?,
                linkedin = ?, twitter = ?, facebook = ?, gallery = ?
            WHERE id = ?`,
            [
                investor_id, company_name, property_name, industry_type,
                availability_status, zone, country, description,
                contact_name, contact_phone, investment_type,
                established_date, website, image,
                meta_title, meta_description, meta_keywords, slug,
                linkedin, twitter, facebook, JSON.stringify(finalGallery),
                id
            ]
        );

        res.status(200).json({ message: 'Investor updated successfully' });
    } catch (error) {
        console.error('Error updating investor:', error);
        res.status(500).json({ message: 'Error updating investor', error: error.message });
    }
};

exports.deleteInvestor = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM investors WHERE id = ?', [id]);
        res.status(200).json({ message: 'Investor deleted successfully' });
    } catch (error) {
        console.error('Error deleting investor:', error);
        res.status(500).json({ message: 'Error deleting investor', error: error.message });
    }
};
