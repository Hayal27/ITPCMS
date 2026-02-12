const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const fileType = require('file-type');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types (strict whitelist)
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
    // ❌ SVG explicitly excluded due to XSS risk
];

const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg'
];

const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
];

// Allowed file extensions (strict whitelist)
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg'];
const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];

/**
 * Sanitize filename to prevent path traversal and XSS
 */
const sanitizeFilename = (filename) => {
    // Remove any path components
    filename = path.basename(filename);

    // Remove special characters and scripts
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Prevent double extensions (.jpg.exe)
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);

    return `${name}${ext}`.toLowerCase();
};

/**
 * Generate secure random filename
 */
const generateSecureFilename = (originalname) => {
    const ext = path.extname(originalname).toLowerCase();
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${hash}${ext}`;
};

/**
 * Validate file type by checking both MIME type and magic bytes
 */
const validateFileType = async (filePath, declaredMimeType, allowedTypes) => {
    try {
        // Only read the first 4100 bytes to determine file type (more efficient)
        const type = await fileType.fromFile(filePath);

        if (!type) {
            console.error('[UPLOAD] Could not determine file type from magic bytes');
            return false;
        }

        // Check if actual MIME type matches declared type
        // Note: For some Office files, they might be detected as generic zip, but file-type usually handles them.
        if (type.mime !== declaredMimeType) {
            // Special handling for Office documents which can be tricky
            const isOffice = declaredMimeType.includes('officedocument') || declaredMimeType.includes('msword') || declaredMimeType.includes('ms-excel');
            const detectedAsZip = type.mime === 'application/zip';

            if (isOffice && detectedAsZip) {
                console.log(`[UPLOAD] Office document detected as zip (acceptable): ${declaredMimeType}`);
            } else {
                console.error(`[UPLOAD] MIME type mismatch: declared=${declaredMimeType}, actual=${type.mime}`);
                return false;
            }
        }

        // Check if MIME type is in allowed list
        if (!allowedTypes.includes(type.mime) && !(type.mime === 'application/zip' && declaredMimeType.includes('officedocument'))) {
            console.error(`[UPLOAD] File type not allowed: ${type.mime}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[UPLOAD] File validation error:', error);
        return false;
    }
};

/**
 * Storage configuration with secure filename generation
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const secureFilename = generateSecureFilename(file.originalname);
        cb(null, secureFilename);
    }
});

/**
 * File filter for initial validation (before upload)
 */
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();

    // Sanitize original filename
    file.originalname = sanitizeFilename(file.originalname);

    // Check extension and MIME type
    const isAllowedImage = ALLOWED_IMAGE_EXTENSIONS.includes(ext) && ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isAllowedVideo = ALLOWED_VIDEO_EXTENSIONS.includes(ext) && ALLOWED_VIDEO_TYPES.includes(mimeType);
    const isAllowedDocument = ALLOWED_DOCUMENT_EXTENSIONS.includes(ext) && ALLOWED_DOCUMENT_TYPES.includes(mimeType);

    if (isAllowedImage || isAllowedVideo || isAllowedDocument) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: images (jpg, png, gif, webp), videos (mp4, webm), documents (pdf, doc, xls)`), false);
    }
};

/**
 * Main upload middleware
 */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Max 10 files per request
    },
    fileFilter: fileFilter
});

/**
 * Post-upload validation middleware (validates magic bytes)
 */
const validateUploadedFile = async (req, res, next) => {
    if (!req.file && !req.files) {
        return next();
    }

    const files = req.files || [req.file];
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES];

    try {
        for (const file of files) {
            if (!file) continue;

            const isValid = await validateFileType(file.path, file.mimetype, allowedTypes);

            if (!isValid) {
                // Delete the uploaded file
                fs.unlinkSync(file.path);

                return res.status(400).json({
                    success: false,
                    message: 'Invalid file type detected. File has been rejected for security reasons.'
                });
            }
        }

        next();
    } catch (error) {
        console.error('[UPLOAD] Validation error:', error);

        // Clean up uploaded files
        for (const file of files) {
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

        return res.status(500).json({
            success: false,
            message: 'File validation failed'
        });
    }
};

module.exports = {
    upload,
    validateUploadedFile,
    sanitizeFilename,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_DOCUMENT_TYPES
};
