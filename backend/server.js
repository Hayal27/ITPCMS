const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
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
const loggingMiddleware = require("./middleware/loggingMiddleware.js");

const app = express();
const PORT = 5001;

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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});