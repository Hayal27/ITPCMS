const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const { upload, validateUploadedFile } = require("../middleware/uploadMiddleware");
const { sanitizeInput, validateRequired } = require("../middleware/inputValidation");
const verifyToken = require("../middleware/verifyToken");
const { hasMenuPermission } = require("../middleware/menuPermissionMiddleware");

// Public
router.get("/media", mediaController.getMediaItems);
router.get("/mediaf", mediaController.getMediaItems);

// Protected (Admin levels based on permissions matrix)
router.post(
  "/media",
  verifyToken,
  hasMenuPermission("/post/manageGallery"),
  upload.any(),
  validateUploadedFile,
  sanitizeInput(['title', 'description', 'caption']),
  validateRequired(['title']),
  mediaController.addMediaItem
);

router.put(
  "/mediaup/:id",
  verifyToken,
  hasMenuPermission("/post/manageGallery"),
  upload.any(),
  validateUploadedFile,
  sanitizeInput(['title', 'description', 'caption']),
  mediaController.updateMediaItem
);

router.delete(
  "/media/:id",
  verifyToken,
  hasMenuPermission("/post/manageGallery"),
  mediaController.deleteMediaItem
);

module.exports = router;
