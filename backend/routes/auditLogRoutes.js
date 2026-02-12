const express = require("express");
const auditLogController = require("../controllers/auditLogController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const { restrictTo } = require('../middleware/roleMiddleware');

// Only allow authenticated admins to view logs and manage blocked IPs
router.get("/", authMiddleware.verifyToken, restrictTo(1), auditLogController.getLogs);
router.get("/blocked-ips", authMiddleware.verifyToken, restrictTo(1), auditLogController.getBlockedIPs);
router.delete("/blocked-ips/:id", authMiddleware.verifyToken, restrictTo(1), auditLogController.unblockIP);

module.exports = router;
