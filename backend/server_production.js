const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const fs = require("fs");
const cookieParser = require("cookie-parser");

// --- 1. EMERGENCY STARTUP LOGGER ---
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION!', err);
    process.exit(1);
});

// --- 2. ENV CONFIGURATION ---
const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

console.log(`✅ App Starting in ${process.env.NODE_ENV || 'development'} mode`);

// Standardized DB connection
const db = require("./models/db");

const app = express();
app.use(cookieParser());

// Trust first proxy (critical for Nginx/Plesk)
app.set("trust proxy", 1);

// --- 3. CORS SETUP (Consolidated) ---
const allowedOrigins = [
    "https://admin.ethiopianitpark.et",
    "https://ethiopianitpark.et",
    "https://www.ethiopianitpark.et",
    "https://api.ethiopianitpark.et",
    "http://localhost:3000",
    "http://localhost:3033",
    "http://localhost:5173",
    "http://localhost:3001",
    "http://localhost:3002",
];

app.use(cors({
    origin: (origin, callback) => {
        const allowedPatterns = [
            "https://admin.ethiopianitpark.et",
            "https://ethiopianitpark.et",
            "https://www.ethiopianitpark.et",
            "https://api.ethiopianitpark.et",
            "https://api-cms.startechaigroup.com"
        ];

        const isLocal = !origin ||
            origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin.startsWith("http://localhost");

        const isDomainMatch = origin && (
            allowedPatterns.includes(origin) ||
            origin.endsWith("ethiopianitpark.et") ||
            origin.endsWith("startechaigroup.com")
        );

        if (isLocal || isDomainMatch) {
            callback(null, origin || "*");
        } else {
            console.error(`[CORS] Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "X-Custom-Header"
    ],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200
}));

// Global Vary & Cache-Control to handle CORS and caching fix
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedPatterns = [
        "https://admin.ethiopianitpark.et",
        "https://ethiopianitpark.et",
        "https://www.ethiopianitpark.et",
        "https://api.ethiopianitpark.et",
        "https://api-cms.startechaigroup.com"
    ];

    const isAllowed = origin && (
        allowedPatterns.includes(origin) ||
        origin.endsWith("ethiopianitpark.et") ||
        origin.endsWith("startechaigroup.com") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
    );

    if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Vary', 'Origin');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// --- 4. MIDDLEWARE stack ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
    }
}));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "itp_cms_secure_session_fallback_2026",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 3600000, // 1 hour
            httpOnly: true,
            secure: true, // Required for SameSite: 'none'
            sameSite: "none",
        },
    })
);

// --- 5. ROUTES ---
// We wrap these in try-catch to identify failing modules on Plesk
try {
    app.get("/api/rescue", async (req, res) => {
        try {
            await db.promise().query("DELETE FROM blocked_ips");
            await db.promise().query("UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL");
            res.json({ success: true, message: "All IP blocks and account locks have been cleared." });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.use("/api", require("./routes/userRoutes.js"));
    app.use("/api/employees", require("./routes/employeeRoutes.js"));
    app.use("/api/roles", require("./routes/roleRoutes.js"));
    app.use("/api/offices", require("./routes/officeRoutes.js"));
    app.use("/api/lands", require("./routes/landRoutes.js"));
    app.use("/api/incubation", require("./routes/incubationRoutes.js"));
    app.use("/api/investor-inquiries", require("./routes/investorInquiryRoutes.js"));
    app.use("/api/menus", require("./routes/menuRoutes.js"));
    app.use("/api", require("./routes/authRoutes.js"));

    // Business Modules
    app.use("/api", require("./routes/eventRoutes.js"));
    app.use("/api/id-card-persons", require("./routes/idCardPersonRoutes.js"));
    app.use("/api/about", require("./routes/aboutRoutes.js"));
    app.use("/api/trainings", require("./routes/trainingRoutes.js"));
    app.use("/api/live-events", require("./routes/liveEventRoutes.js"));
    app.use("/api/ids", require("./routes/idRoutes.js"));
    app.use("/api/partners-investors", require("./routes/partnersInvestorsRoutes.js"));
    app.use("/api/invest", require("./routes/investRoutes.js"));
    app.use("/api/faqs", require("./routes/faqRoutes.js"));
    app.use("/api/careers", require("./routes/careerRoutes.js"));
    app.use("/api/audit-logs", require("./routes/auditLogRoutes.js"));
    app.use("/api/analytics", require("./routes/analyticsRoutes.js"));
    app.use("/api", require("./routes/newsRoutes.js"));
    app.use("/api", require("./routes/contactRoutes.js"));
    app.use("/api", require("./routes/subscriptionRoutes.js"));
} catch (routeErr) {
    console.error("❌ CRITICAL: Failed to load a route module!", routeErr);
}

// Health Check
app.get("/", (req, res) => res.json({ message: "ITPC CMS API is running", version: "1.0.0" }));
app.get("/api/health", (req, res) => res.json({ status: "UP", time: new Date() }));

// Catch-all 404 handler
app.use((req, res) => {
    console.warn(`[404] Unmatched Route: ${req.method} ${req.url} from ${req.ip}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found on this API server.`
    });
});

const server = http.createServer(app);
const PORT = process.env.PORT || 5005;

server.listen(PORT, () => {
    console.log(`🚀 Production Server running on port ${PORT}`);
});
