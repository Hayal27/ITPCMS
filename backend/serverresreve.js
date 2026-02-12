const express = require("express"); // Last updated: 2026-01-05 17:30
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const http = require("http");
const { ExpressPeerServer } = require("peer");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: path.resolve(__dirname, envFile) });

console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`✅ Loading config from: ${envFile}`);

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
const loggingMiddleware = require("./middleware/loggingMiddleware.js");
const verifyToken = require("./middleware/verifyToken.js");
const setupSocket = require("./socketHandler.js");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5005;

// PeerJS Server Setup
const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  proxied: false
});
app.use("/peerjs", peerServer);
setupSocket(server);

// Middleware
const allowedPatterns = [
  "https://admin.ethiopianitpark.et",
  "https://ethiopianitpark.et",
  "https://www.ethiopianitpark.et",
  "https://api.ethiopianitpark.et",
  "https://api-cms.startechaigroup.com",
  "http://localhost:3033",
  "http://localhost:3034",
  "http://localhost:3035",
  "http://localhost:3036",
  "http://localhost:3037",
  "http://localhost:3038",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
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
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept,X-Custom-Header",
  credentials: true,
};
app.use(cors(corsOptions));

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

// Trust first proxy (if behind Nginx/Heroku)
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "cms_default_session_secret_change_me",
    resave: false,
    saveUninitialized: false, // Changed to false for better security
    cookie: {
      maxAge: 3600000, // 1 hour
      httpOnly: true, // Prevents XSS from reading the cookie
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "strict", // Protects against CSRF
    },
  })
);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting for production protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Reduced from 1000 for better security
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  message: { message: "Too many login attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// --- Health Check & Discovery Routes ---
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ITPCMS API Service is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
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
app.use("/api", employeeRoutes);
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
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api", newsRoutes);
app.use("/api", eventRoutes);
app.use("/api", mediaRoutes);
app.use("/api/about", aboutRoutes);
// Auth Routes with brute-force protection
app.post("/login", authLimiter, authMiddleware.login);
app.put("/logout/:user_id", verifyToken, authMiddleware.logout);
app.post("/forgot-password", authLimiter, authMiddleware.forgotPassword);
app.post("/reset-password", authLimiter, authMiddleware.resetPassword);
app.post("/redeem-account", authLimiter, authMiddleware.redeemAccount);
app.post("/resend-redemption", authLimiter, authMiddleware.resendRedemptionCode);
app.post("/change-password", authLimiter, verifyToken, authMiddleware.changePassword);

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
});
