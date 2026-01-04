
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ success: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Failed to authenticate token" });
    }

    // Attach decoded info to req for controller use
    req.user = decoded;
    req.user_id = decoded.user_id; // For compatibility across controllers
    next();
  });
};

module.exports = verifyToken;
