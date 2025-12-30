const express = require('express');
const router = express.Router();
const incubationController = require('../controllers/incubationController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/incubation';
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

// Programs
router.get('/programs', incubationController.getPrograms);
router.post('/programs', incubationController.createProgram);
router.put('/programs/:id', incubationController.updateProgram);
router.delete('/programs/:id', incubationController.deleteProgram);

// Success Stories
router.get('/stories', incubationController.getSuccessStories);
router.post('/stories', upload.fields([{ name: 'image', maxCount: 1 }]), incubationController.createSuccessStory);
router.put('/stories/:id', upload.fields([{ name: 'image', maxCount: 1 }]), incubationController.updateSuccessStory);
router.delete('/stories/:id', incubationController.deleteSuccessStory);

module.exports = router;
