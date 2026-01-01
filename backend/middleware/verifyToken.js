
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Extract token from "Bearer token"
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ success: false, message: "No token provided" });
  }

  // Verify token and extract payload
  jwt.verify(token, process.env.JWT_SECRET || 'cms_default_jwt_secret_change_me', (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Failed to authenticate token" });
    }

    // Attach the decoded user information to the req object
    req.user = decoded; // now req.user.user_id will be available
    next();
  });
};

module.exports = verifyToken;
