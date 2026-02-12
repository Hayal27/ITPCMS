const rateLimit = require('express-rate-limit');

// Strict limiter for submissions (Comments, Contact Form)
const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 submissions per 15 minutes
    message: {
        success: false,
        message: 'Too many submissions from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Moderate limiter for public API reads
const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 requests per 15 minutes
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    submissionLimiter,
    publicApiLimiter
};
