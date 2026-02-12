const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const verifyToken = require('../middleware/verifyToken');
const rateLimit = require('express-rate-limit');

// Stricter limiter for auth routes to prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Increased slightly for testing
    message: { message: "Too many login attempts, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS', // CRITICAL: Don't rate limit preflight
});

router.post("/login", authLimiter, authMiddleware.login);
router.get("/check-auth", verifyToken, authMiddleware.getCurrentUser);
router.put("/logout/:user_id", verifyToken, authMiddleware.logout);
router.post("/forgot-password", authLimiter, authMiddleware.forgotPassword);
router.post("/reset-password", authLimiter, authMiddleware.resetPassword);
router.post("/redeem-account", authLimiter, authMiddleware.redeemAccount);
router.post("/resend-redemption", authLimiter, authMiddleware.resendRedemptionCode);
router.post("/change-password", authLimiter, verifyToken, authMiddleware.changePassword);

module.exports = router;
