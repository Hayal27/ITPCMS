const express = require('express');
const router = express.Router();
const partnersInvestorsController = require('../controllers/partnersInvestorsController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/partners-investors');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

// Partners routes
router.get('/partners', partnersInvestorsController.getPartners);
router.post('/partners', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), partnersInvestorsController.createPartner);
router.put('/partners/:id', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), partnersInvestorsController.updatePartner);
router.delete('/partners/:id', partnersInvestorsController.deletePartner);

// Investors routes
router.get('/investors', partnersInvestorsController.getInvestors);
router.post('/investors', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), partnersInvestorsController.createInvestor);
router.put('/investors/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), partnersInvestorsController.updateInvestor);
router.delete('/investors/:id', partnersInvestorsController.deleteInvestor);

module.exports = router;
