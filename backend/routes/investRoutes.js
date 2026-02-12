
const express = require('express');
const router = express.Router();
const investController = require('../controllers/investController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/invest';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Secure File Filter
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, Word docs, and Zips are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

// Steps Routes
router.get('/steps', investController.getAllSteps);
router.post('/steps', verifyToken, restrictTo(1), upload.single('doc'), investController.createStep);
router.put('/steps/:id', verifyToken, restrictTo(1), upload.single('doc'), investController.updateStep);
router.delete('/steps/:id', verifyToken, restrictTo(1), investController.deleteStep);

// Resources Routes
router.get('/resources', investController.getAllResources);
router.post('/resources', verifyToken, restrictTo(1), upload.single('file'), investController.createResource);
router.delete('/resources/:id', verifyToken, restrictTo(1), investController.deleteResource);

module.exports = router;
