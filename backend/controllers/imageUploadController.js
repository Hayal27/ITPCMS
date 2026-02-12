// Image upload handler for ID card persons
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/id-photos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Sanitize filename to remove dangerous characters
        const safeName = path.parse(file.originalname).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const extension = path.extname(file.originalname).toLowerCase();

        // Strict allow-list for extensions
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowedExtensions.includes(extension)) {
            return cb(new Error('Invalid file extension'), '');
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'photo-' + safeName + '-' + uniqueSuffix + extension);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Upload handler
exports.uploadPhoto = (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            console.error('Multer upload error:', err);

            // Handle specific Multer errors
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ success: false, message: 'File is too large. Max limit is 5MB.' });
                }
                return res.status(400).json({ success: false, message: 'File upload failed.' });
            }

            // Handle our custom filter errors
            if (err.message === 'Only image files are allowed!' || err.message === 'Invalid file extension') {
                return res.status(400).json({ success: false, message: err.message });
            }

            return res.status(500).json({ success: false, message: 'An internal error occurred during file upload.' });
        }
        next();
    });
};

exports.handlePhotoUpload = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const photoUrl = `/uploads/id-photos/${req.file.filename}`;
        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            photo_url: photoUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error processing photo upload:', error);
        res.status(500).json({ success: false, message: 'An unexpected error occurred while processing the upload.' });
    }
};
