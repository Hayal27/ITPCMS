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

const verifyToken = require('../middleware/verifyToken');

// Programs
router.get('/programs', incubationController.getPrograms);
router.post('/programs', verifyToken, incubationController.createProgram);
router.put('/programs/:id', verifyToken, incubationController.updateProgram);
router.delete('/programs/:id', verifyToken, incubationController.deleteProgram);

// Success Stories
router.get('/stories', incubationController.getSuccessStories);
router.post('/stories', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }]), incubationController.createSuccessStory);
router.put('/stories/:id', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }]), incubationController.updateSuccessStory);
router.delete('/stories/:id', verifyToken, incubationController.deleteSuccessStory);

module.exports = router;
