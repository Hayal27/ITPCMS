
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

const upload = multer({ storage: storage });

// Steps Routes
router.get('/steps', investController.getAllSteps);
router.post('/steps', upload.single('doc'), investController.createStep);
router.put('/steps/:id', upload.single('doc'), investController.updateStep);
router.delete('/steps/:id', investController.deleteStep);

// Resources Routes
router.get('/resources', investController.getAllResources);
router.post('/resources', upload.single('file'), investController.createResource);
router.delete('/resources/:id', investController.deleteResource);

module.exports = router;
