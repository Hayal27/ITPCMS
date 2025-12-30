
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

router.get('/', trainingController.getAllTrainings);
router.get('/:id', trainingController.getTrainingById);
router.post('/', upload.single('image'), trainingController.createTraining);
router.put('/:id', upload.single('image'), trainingController.updateTraining);
router.delete('/:id', trainingController.deleteTraining);

module.exports = router;
