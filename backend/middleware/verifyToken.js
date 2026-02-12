const jwt = require("jsonwebtoken");
const pool = require("../models/db");

// Constants for session management
const SESSION_INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes
const MAX_SESSION_LIFETIME = 4 * 60 * 60 * 1000; // 4 hours absolute max

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.cookies?.token;

  if (!token) {
    return res.status(403).json({ success: false, message: "No token provided" });
  }

  try {
    // 0. Check if token is revoked
    const [revoked] = await pool.promise().query("SELECT id FROM revoked_tokens WHERE token = ?", [token]);
    if (revoked.length > 0) {
      console.warn("[SECURITY] Attempt to use revoked token detected.");
      res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
      return res.status(401).json({ success: false, message: "Session invalidated. Please login again." });
    }

    // Verify token and extract payload
    jwt.verify(token, process.env.JWT_SECRET || 'cms_default_jwt_secret_change_me', (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
          return res.status(401).json({ success: false, message: "Session expired due to inactivity. Please login again." });
        }
        return res.status(401).json({ success: false, message: "Failed to authenticate token" });
      }

      const now = Date.now();
      const initialLogin = decoded.initial_login ? new Date(decoded.initial_login).getTime() : now; // Fallback for legacy tokens

      // 1. Enforce Maximum Session Lifetime (Absolute Timeout)
      if (now - initialLogin > MAX_SESSION_LIFETIME) {
        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
        return res.status(401).json({ success: false, message: "Maximum session lifetime exceeded. Please login again." });
      }

      // 2. Sliding Window: Refresh Cookie if user is active and token is valid
      const tokenAge = now - (decoded.iat * 1000);
      if (tokenAge > 5 * 60 * 1000) {
        const payload = {
          user_id: decoded.user_id,
          role_id: decoded.role_id,
          initial_login: initialLogin // Preserve original login time
        };

        const newToken = jwt.sign(payload, process.env.JWT_SECRET || 'cms_default_jwt_secret_change_me', { expiresIn: '30m' });

        res.cookie('token', newToken, {
          httpOnly: true,
          secure: true, // Required for SameSite: 'none'
          sameSite: 'none', // Required for cross-site
          maxAge: SESSION_INACTIVITY_LIMIT // Reset inactivity timer
        });
      }

      // Attach info to req
      req.user = decoded;
      req.user_id = decoded.user_id;
      req.token = token; // Attach token for revocation
      next();
    });
  } catch (dbError) {
    console.error("[SECURITY] DB error in verifyToken:", dbError);
    return res.status(500).json({ success: false, message: "Internal security error" });
  }
};

module.exports = verifyToken;
