const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const aboutController = require("../controllers/aboutController");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "board-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    },
});

// Board Members
router.get("/board-members", aboutController.getBoardMembers);
router.post("/board-members", upload.single("imageFile"), aboutController.addBoardMember);
router.put("/board-members/:id", upload.single("imageFile"), aboutController.updateBoardMember);
router.delete("/board-members/:id", aboutController.deleteBoardMember);

// Who We Are Sections
router.get("/who-we-are", aboutController.getWhoWeAreSections);
router.post("/who-we-are", upload.single("imageFile"), aboutController.addWhoWeAreSection);
router.put("/who-we-are/:id", upload.single("imageFile"), aboutController.updateWhoWeAreSection);
router.delete("/who-we-are/:id", aboutController.deleteWhoWeAreSection);

module.exports = router;
