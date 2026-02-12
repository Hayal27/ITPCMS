const db = require('../models/db');
const fs = require('fs');
const path = require('path');
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

// Production-Safe Error Handler
const sendError = (res, error, status = 500) => {
    console.error(`[PARTNERS SECURITY] Error:`, error);
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'A secure processing error occurred. Detailed logs are available to admins.'
            : error.message
    });
};

// Backend Sanitizer
const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).trim();
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
        sendError(res, error);
    }
};

exports.createPartner = async (req, res) => {
    try {
        let {
            partner_id, company_name, contact_name, contact_email,
            partnership_type, country, zone, industry_type,
            agreement_start_date, agreement_end_date, status,
            services_provided, description,
            meta_title, meta_description, meta_keywords, slug,
            website, linkedin, twitter, facebook
        } = req.body;

        // Sanitize Strings
        partner_id = cleanString(partner_id);
        company_name = cleanString(company_name);
        contact_name = cleanString(contact_name);
        description = cleanString(description);

        const logo = req.files?.logo ? `/uploads/partners-investors/${req.files.logo[0].filename}` : req.body.logo;
        const galleryFiles = req.files?.gallery ? req.files.gallery.map(f => `/uploads/partners-investors/${f.filename}`) : [];

        // In case services_provided comes as a string from FormData
        let parsedServices = services_provided;
        if (typeof services_provided === 'string') {
            try {
                parsedServices = JSON.parse(services_provided);
            } catch (e) {
                parsedServices = services_provided.split(',').map(s => cleanString(s.trim()));
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
                cleanString(meta_title), cleanString(meta_description), cleanString(meta_keywords), cleanString(slug),
                website, linkedin, twitter, facebook,
                JSON.stringify(galleryFiles)
            ]
        );

        res.status(201).json({ message: 'Partner created successfully', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updatePartner = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        let {
            partner_id, company_name, contact_name, contact_email,
            partnership_type, country, zone, industry_type,
            agreement_start_date, agreement_end_date, status,
            services_provided, description,
            meta_title, meta_description, meta_keywords, slug,
            website, linkedin, twitter, facebook
        } = req.body;

        partner_id = cleanString(partner_id);
        company_name = cleanString(company_name);
        contact_name = cleanString(contact_name);
        description = cleanString(description);

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
                parsedServices = services_provided.split(',').map(s => cleanString(s.trim()));
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
                cleanString(meta_title), cleanString(meta_description), cleanString(meta_keywords), cleanString(slug),
                website, linkedin, twitter, facebook, JSON.stringify(finalGallery),
                idNum
            ]
        );

        res.status(200).json({ message: 'Partner updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deletePartner = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        // Find partner to get logo and gallery paths
        const [partner] = await query('SELECT logo, gallery FROM partners WHERE id = ?', [idNum]);

        await query('DELETE FROM partners WHERE id = ?', [idNum]);

        if (partner) {
            // Delete logo
            if (partner.logo) {
                const logoPath = path.join(__dirname, '..', partner.logo);
                if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
            }
            // Delete gallery images
            if (partner.gallery) {
                try {
                    const gallery = JSON.parse(partner.gallery);
                    if (Array.isArray(gallery)) {
                        gallery.forEach(img => {
                            const imgPath = path.join(__dirname, '..', img);
                            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        });
                    }
                } catch (e) { console.error("Error parsing gallery JSON on delete:", e); }
            }
        }

        res.status(200).json({ message: 'Partner deleted successfully' });
    } catch (error) {
        sendError(res, error);
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
        sendError(res, error);
    }
};

exports.createInvestor = async (req, res) => {
    try {
        let {
            investor_id, company_name, property_name, industry_type,
            availability_status, zone, country, description,
            contact_name, contact_phone, investment_type,
            established_date, website,
            meta_title, meta_description, meta_keywords, slug,
            linkedin, twitter, facebook
        } = req.body;

        investor_id = cleanString(investor_id);
        company_name = cleanString(company_name);
        property_name = cleanString(property_name);
        description = cleanString(description);
        contact_name = cleanString(contact_name);

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
                cleanString(meta_title), cleanString(meta_description), cleanString(meta_keywords), cleanString(slug),
                linkedin, twitter, facebook, JSON.stringify(galleryFiles)
            ]
        );

        res.status(201).json({ message: 'Investor created successfully', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

exports.updateInvestor = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        let {
            investor_id, company_name, property_name, industry_type,
            availability_status, zone, country, description,
            contact_name, contact_phone, investment_type,
            established_date, website,
            meta_title, meta_description, meta_keywords, slug,
            linkedin, twitter, facebook
        } = req.body;

        investor_id = cleanString(investor_id);
        company_name = cleanString(company_name);
        property_name = cleanString(property_name);
        description = cleanString(description);
        contact_name = cleanString(contact_name);

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
                cleanString(meta_title), cleanString(meta_description), cleanString(meta_keywords), cleanString(slug),
                linkedin, twitter, facebook, JSON.stringify(finalGallery),
                idNum
            ]
        );

        res.status(200).json({ message: 'Investor updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

exports.deleteInvestor = async (req, res) => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

    try {
        // Find investor to get image and gallery paths
        const [investor] = await query('SELECT image, gallery FROM investors WHERE id = ?', [idNum]);

        await query('DELETE FROM investors WHERE id = ?', [idNum]);

        if (investor) {
            // Delete image
            if (investor.image) {
                const imgPath = path.join(__dirname, '..', investor.image);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
            // Delete gallery images
            if (investor.gallery) {
                try {
                    const gallery = JSON.parse(investor.gallery);
                    if (Array.isArray(gallery)) {
                        gallery.forEach(img => {
                            const imgPath = path.join(__dirname, '..', img);
                            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        });
                    }
                } catch (e) { console.error("Error parsing gallery JSON on delete:", e); }
            }
        }

        res.status(200).json({ message: 'Investor deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};
