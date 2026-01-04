
const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/trainings';
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

router.get('/', trainingController.getAllTrainings);
router.get('/:id', trainingController.getTrainingById);
router.post('/', verifyToken, restrictTo(1), upload.single('image'), trainingController.createTraining);
router.put('/:id', verifyToken, restrictTo(1), upload.single('image'), trainingController.updateTraining);
router.delete('/:id', verifyToken, restrictTo(1), trainingController.deleteTraining);

module.exports = router;
