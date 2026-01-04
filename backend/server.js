const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const http = require("http");
const { ExpressPeerServer } = require("peer");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

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
const loggingMiddleware = require("./middleware/loggingMiddleware.js");
const verifyToken = require("./middleware/verifyToken.js");
const setupSocket = require("./socketHandler.js");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5005;

// PeerJS Server Setup
const peerServer = ExpressPeerServer(server, {
  debug: false,
  allow_discovery: true,
  proxied: true
});
app.use("/peerjs", peerServer);
setupSocket(server);

// Middleware
const corsOptions = {
  origin: [process.env.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"], // Allow specific origins
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};
app.use(cors(corsOptions));

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
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting for production protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { message: "Too many requests from this IP, please try again later." },
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
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api", newsRoutes);
app.use("/api", eventRoutes);
app.use("/api", mediaRoutes);
app.use("/api/about", aboutRoutes);
app.post("/login", authMiddleware.login);
// Route Protection for Logout
app.put("/logout/:user_id", verifyToken, authMiddleware.logout);
app.post("/forgot-password", authMiddleware.forgotPassword);
app.post("/reset-password", authMiddleware.resetPassword);
app.post("/redeem-account", authMiddleware.redeemAccount);

// Global Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  const isProduction = process.env.NODE_ENV === "production";
  res.status(500).send({
    message: "Something went wrong!",
    error: isProduction ? "An internal server error occurred." : err.message,
  });
});

// Start Server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`PeerJS Server active on /peerjs`);
});
