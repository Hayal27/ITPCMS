const express = require("express");
const router = express.Router();
const careerController = require("../controllers/careerController");
const { upload, validateUploadedFile } = require("../middleware/uploadMiddleware");
const { sanitizeInput, validateRequired, validateTypes } = require("../middleware/inputValidation");
const verifyCaptcha = require("../middleware/captchaMiddleware");
const { submissionLimiter } = require("../middleware/rateLimiter");

const verifyToken = require("../middleware/verifyToken");
const { hasMenuPermission } = require("../middleware/menuPermissionMiddleware");
const rateLimit = require("express-rate-limit");

// Stricter rate limit for job applications to prevent spam
const applyRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 submissions per hour
    message: {
        success: false,
        message: "Too many applications from this IP, please try again after an hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public Routes
router.get("/jobs", careerController.getJobs);

// Apply for job with secure file upload and input validation
router.post(
    "/jobs/apply",
    submissionLimiter, // Changed from local applyRateLimiter to central submissionLimiter
    upload.single("resume"),
    verifyCaptcha,
    validateUploadedFile,
    sanitizeInput(['coverLetter']), // Allow HTML in cover letter only
    validateRequired(['fullName', 'email', 'phone', 'jobId', 'address']),
    validateTypes({
        fullName: { type: 'name', maxLength: 100 },
        email: { type: 'email', maxLength: 100 },
        phone: { type: 'phone', maxLength: 15 },
        address: { type: 'string', maxLength: 200 },
        coverLetter: { type: 'string', maxLength: 2000 }
    }),
    careerController.applyJob
);

router.get("/jobs/track/:code", careerController.trackApplication);

// Admin Routes (Job Management) - Protected by matrix
router.get(
    "/admin/jobs",
    verifyToken,
    hasMenuPermission('/content/careers'),
    careerController.getJobsAdmin
);

router.post(
    "/admin/jobs",
    verifyToken,
    hasMenuPermission('/content/careers'),
    sanitizeInput(['description', 'requirements', 'responsibilities']), // Allow HTML in these fields
    validateRequired(['title', 'department', 'location', 'type', 'deadline']),
    careerController.createJob
);

router.put(
    "/admin/jobs/:id",
    verifyToken,
    hasMenuPermission('/content/careers'),
    sanitizeInput(['description', 'requirements', 'responsibilities']),
    careerController.updateJob
);

router.delete(
    "/admin/jobs/:id",
    verifyToken,
    hasMenuPermission('/content/careers'),
    careerController.deleteJob
);

// Admin Routes (Application Management) - Protected by matrix
router.get(
    "/admin/applications",
    verifyToken,
    hasMenuPermission('/content/careers'),
    careerController.getApplicationsAdmin
);

router.put(
    "/admin/applications/:id/status",
    verifyToken,
    hasMenuPermission('/content/careers'),
    sanitizeInput(['adminNotes', 'appointmentDetails']),
    careerController.updateStatus
);

router.post(
    "/admin/applications/bulk-status",
    verifyToken,
    hasMenuPermission('/content/careers'),
    sanitizeInput(['adminNotes', 'appointmentDetails']),
    careerController.bulkUpdateStatus
);

// Public status check
router.post(
    "/public/application-status",
    sanitizeInput([]),
    validateRequired(['trackingCode']),
    careerController.checkApplicationStatus
);

module.exports = router;
