const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const http = require("http");
const { ExpressPeerServer } = require("peer");
require("dotenv").config(); // Load environment variables


// ✅ Conditionally use remote or local DB connection
const db = process.env.USE_REMOTE_DB === "true"
  ? require("./models/db.remote.js")
  : require("./models/db.js");

// Importing Routes
const userRoutes = require("./routes/userRoutes.js");
const employeeRoutes = require("./routes/employeeRoutes.js");
const planRoutes = require("./routes/planRoutes.js");
// const dashboardRoutes = require("./routes/dashboardRoutes.js");
const analyticsRoutes = require("./routes/analyticRoutes.js");
const authMiddleware = require("./middleware/authMiddleware.js");
const vehicleRoutes = require("./routes/vehicleRoutes.js");
const queueRoutes = require("./routes/queueRoutes.js");
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
const loggingMiddleware = require("./middleware/loggingMiddleware.js");
const setupSocket = require("./socketHandler.js");

const app = express();
const server = http.createServer(app);
const PORT = 5005;

// PeerJS Server Setup
const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  proxied: true
});
app.use("/peerjs", peerServer);
setupSocket(server);

// Middleware
const corsOptions = {
  origin: "*", // Allow all origins
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: "hayaltamrat@27", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // 1 hour session expiration
  })
);

// Middleware to serve static files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware); // Logs every request

// Using Routes
app.use("/api", userRoutes);
app.use("/api", employeeRoutes);
// app.use("/api", dashboardRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", planRoutes);
app.use("/api", vehicleRoutes);
app.use("/api", queueRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api", contactRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/lands", landRoutes);
app.use("/api/live-events", liveEventRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/partners-investors", partnersInvestorsRoutes);
app.use("/api/incubation", incubationRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/invest", investRoutes);
app.post("/login", authMiddleware.login);
app.put("/logout/:user_id", authMiddleware.logout);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .send({ message: "Something went wrong!", error: err.message });
});

// Start Server and Listen on All Network Interfaces
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 PeerJS Server active on /peerjs`);
});