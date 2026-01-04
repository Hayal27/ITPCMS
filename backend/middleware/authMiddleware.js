// middleware/authMiddleware.js

const { getLogin, logout, forgotPassword, resetPassword, redeemAccount } = require("../models/LoginModel");

const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'hayaltamrat@27';

const authMiddleware = {
  login: (req, res, next) => getLogin(req, res, next),
  logout: (req, res, next) => logout(req, res, next),
  forgotPassword: (req, res, next) => forgotPassword(req, res, next),
  resetPassword: (req, res, next) => resetPassword(req, res, next),
  redeemAccount: (req, res, next) => redeemAccount(req, res, next),

  verifyToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided!" });

    try {
      const verified = jwt.verify(token, JWT_SECRET_KEY);
      req.user = verified;
      next();
    } catch (err) {
      res.status(400).json({ message: "Invalid Token" });
    }
  }
};

module.exports = authMiddleware;
