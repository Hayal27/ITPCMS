const express = require("express");
const router = express.Router();
const careerController = require("../controllers/careerController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/resumes");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF/DOC are allowed."));
        }
    }
});

const verifyToken = require('../middleware/verifyToken');

// Public Routes
router.get("/jobs", careerController.getJobs);
router.post("/jobs/apply", upload.single("resume"), careerController.applyJob);
router.get("/jobs/track/:code", careerController.trackApplication);

// Admin Routes (Job Management)
router.get("/admin/jobs", verifyToken, careerController.getJobsAdmin);
router.post("/admin/jobs", verifyToken, careerController.createJob);
router.put("/admin/jobs/:id", verifyToken, careerController.updateJob);
router.delete("/admin/jobs/:id", verifyToken, careerController.deleteJob);

// Admin Routes (Application Management)
router.get("/admin/applications", verifyToken, careerController.getApplicationsAdmin);
router.put("/admin/applications/:id/status", verifyToken, careerController.updateStatus);
router.post("/admin/applications/bulk-status", verifyToken, careerController.bulkUpdateStatus);

// Public status check
router.post("/public/application-status", careerController.checkApplicationStatus);

module.exports = router;
