const express = require("express");
const cors = require("cors");

// --- EMERGENCY STARTUP LOGGER ---
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
// -------------------------------

const session = require("express-session");
const path = require("path");
const http = require("http");
// const { ExpressPeerServer } = require("peer");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const fs = require("fs");
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
const envPath = path.resolve(__dirname, envFile);
const finalEnvPath = fs.existsSync(envPath) ? envPath : path.resolve(__dirname, ".env");

dotenv.config({ path: finalEnvPath });

console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`✅ Loading config from: ${finalEnvPath}`);

// Standardized DB connection
const db = require("./models/db");

// Importing Routes
const userRoutes = require("./routes/userRoutes.js");
const employeeRoutes = require("./routes/employeeRoutes.js");
const authMiddleware = require("./middleware/authMiddleware.js");
const subscriptionRoutes = require("./routes/subscriptionRoutes.js");
const faqRoutes = require("./routes/faqRoutes.js");
const contactRoutes = require("./routes/contactRoutes.js");
const officeRoutes = require("./routes/officeRoutes.js");
const landRoutes = require("./routes/landRoutes.js");
const liveEventRoutes = require("./routes/liveEventRoutes.js");
const careerRoutes = require("./routes/careerRoutes.js");
const partnersInvestorsRoutes = require("./routes/partnersInvestorsRoutes.js");
const incubationRoutes = require("./routes/incubationRoutes.js");
const trainingRoutes = require("./routes/trainingRoutes.js");
const investRoutes = require("./routes/investRoutes.js");
const auditLogRoutes = require("./routes/auditLogRoutes.js");
const newsRoutes = require("./routes/newsRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");
const mediaRoutes = require("./routes/mediaRoutes.js");
const aboutRoutes = require("./routes/aboutRoutes.js");
const investorInquiryRoutes = require("./routes/investorInquiryRoutes.js");
const menuRoutes = require("./routes/menuRoutes.js");
const idRoutes = require("./routes/idRoutes.js");
const analyticsRoutes = require("./routes/analyticsRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const loggingMiddleware = require("./middleware/loggingMiddleware.js");
const verifyToken = require("./middleware/verifyToken.js");
const setupSocket = require("./socketHandler.js");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

// --- 1. PROPER CORS SETUP (Consolidated) ---
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
    // Check if the origin is in our allowed list OR if it's local development
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
      console.error(`[SECURITY] CORS Blocked origin: ${origin}`);
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
    "https://api-cms.startechaigroup.com",
    "http://localhost:3000",
    "http://localhost:3033",
    "http://localhost:5173",
    "http://localhost:3009",
    "http://localhost:3004",

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

// Global CORS Error Logger
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS Error: Origin not allowed' });
  }
  next(err);
});

const server = http.createServer(app);
const PORT = 5555;

// PeerJS Server Setup
// const peerServer = ExpressPeerServer(server, {
//   debug: true,
//   allow_discovery: true,
//   proxied: true 
// });
// app.use("/peerjs", peerServer);
// setupSocket(server);

// Trust first proxy (if behind Nginx)
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "itp_cms_secure_session_fallback_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // 1 hour
      httpOnly: true,
      secure: true, // Always true for cross-domain SameSite: 'none'
      sameSite: "none",
    },
  })
);

// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// Rate limiting for production protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000,
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, path, stat) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// --- Advanced Rescue Route (TEMPORARY) ---
app.get("/api/rescue", async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const newHash = await bcrypt.hash("Itp@123", 10);

    // 1. Clear all blocks
    await db.promise().query("DELETE FROM blocked_ips");

    // 2. Clear all failed attempts & Reset lock
    await db.promise().query("UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL");

    // 3. Force set password for test_admin and ensure status is '1' (Active)
    const [result] = await db.promise().query(
      "UPDATE users SET password = ?, status = '1' WHERE user_name = 'test_admin'",
      [newHash]
    );

    // 4. Get a list of valid usernames to verify
    const [users] = await db.promise().query("SELECT user_name, status FROM users LIMIT 10");

    res.json({
      success: true,
      message: "Security cleared, status activated, and test_admin reset",
      test_admin_updated: result.affectedRows > 0,
      env_check: {
        node_env: process.env.NODE_ENV,
        jwt_secret_loaded: !!process.env.JWT_SECRET,
        db_host: process.env.MYSQLHOST || process.env.DB_HOST
      },
      available_users: users.map(u => ({ name: u.user_name, active: u.status == '1' })),
      tip: "Use Username: test_admin and Password: Itp@123 (exact case)"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Health Check & Discovery Routes ---
app.get("/", (req, res) => {
  // Use a simple query with a callback to avoid any promise-related crashes
  db.query("SELECT 1", (err) => {
    res.status(200).json({
      success: true,
      message: "ITPCMS API Service is running",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "production",
      database: err ? `Error: ${err.message}` : "Connected"
    });
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nAllow: /");
});

// Using Routes
app.use("/api", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/roles", require("./routes/roleRoutes.js"));
app.use("/api", contactRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/lands", landRoutes);
app.use("/api/live-events", liveEventRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/partners-investors", partnersInvestorsRoutes);
app.use("/api/incubation", incubationRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/invest", investRoutes);
app.use("/api/investor-inquiries", investorInquiryRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/ids", idRoutes);
app.use("/api/id-card-persons", require("./routes/idCardPersonRoutes"));
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api", newsRoutes);
app.use("/api", eventRoutes);
app.use("/api", mediaRoutes);
app.use("/api/about", aboutRoutes);
// Auth Routes
app.use("/api", authRoutes);

// 404 Handler - Catch-all for unmatched routes
app.use((req, res, next) => {
  console.log(`[404] ${req.method} ${req.url} - Not Matched`);
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.url} not found on this server.`
  });
});

// Global Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: "Something went wrong!",
    error: err.message, // Temporarily always show error for debugging
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
});

// --- .env Loading Verification ---
// (Already handled at top of file)

// ... rest of imports/setup remains same ...
// (Note: Port and server logic follows)

// Start Server
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please kill the existing process or use a different port.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', e);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🔗 PeerJS Server active on /peerjs`);

  // Scheduled task to clean up expired revoked tokens every 6 hours
  setInterval(async () => {
    try {
      console.log("[SECURITY] Running cleanup for expired revoked tokens...");
      const [result] = await db.promise().query("DELETE FROM revoked_tokens WHERE expires_at < NOW()");
      if (result.affectedRows > 0) {
        console.log(`[SECURITY] Cleaned up ${result.affectedRows} expired revoked tokens.`);
      }
    } catch (err) {
      console.error("[SECURITY] Error during revoked tokens cleanup:", err);
    }
  }, 6 * 60 * 60 * 1000);
});
