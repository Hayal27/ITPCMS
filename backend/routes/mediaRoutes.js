const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const upload = require("../middleware/uploadMiddleware");
const verifyToken = require("../middleware/verifyToken");
const { restrictTo } = require("../middleware/roleMiddleware");

// Public
router.get("/media", mediaController.getMediaItems);
router.get("/mediaf", mediaController.getMediaItems);

// Protected (Admin)
router.post("/media", verifyToken, restrictTo(1), upload.any(), mediaController.addMediaItem);
router.put("/mediaup/:id", verifyToken, restrictTo(1), upload.any(), mediaController.updateMediaItem);
router.delete("/media/:id", verifyToken, restrictTo(1), mediaController.deleteMediaItem);

module.exports = router;
