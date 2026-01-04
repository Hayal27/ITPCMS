
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
