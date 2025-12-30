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

// Public Routes
router.get("/jobs", careerController.getJobs);
router.post("/jobs/apply", upload.single("resume"), careerController.applyJob);
router.get("/jobs/track/:code", careerController.trackApplication);

// Admin Routes (Job Management)
router.get("/admin/jobs", careerController.getJobsAdmin);
router.post("/admin/jobs", careerController.createJob);
router.put("/admin/jobs/:id", careerController.updateJob);
router.delete("/admin/jobs/:id", careerController.deleteJob);

// Admin Routes (Application Management)
router.get("/admin/applications", careerController.getApplicationsAdmin);
router.put("/admin/applications/:id/status", careerController.updateStatus);
router.post("/admin/applications/bulk-status", careerController.bulkUpdateStatus);

// Public status check
router.post("/public/application-status", careerController.checkApplicationStatus);

module.exports = router;
