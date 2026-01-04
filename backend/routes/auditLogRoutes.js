const express = require("express");
const auditLogController = require("../controllers/auditLogController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Only allow authenticated users (and potentially only admins) to view logs
// assuming authMiddleware.verifyToken is the standard protection
// You might want to add role verification here too
router.get("/", authMiddleware.verifyToken, auditLogController.getLogs);
router.get("/blocked-ips", authMiddleware.verifyToken, auditLogController.getBlockedIPs);
router.delete("/blocked-ips/:id", authMiddleware.verifyToken, auditLogController.unblockIP);

module.exports = router;
