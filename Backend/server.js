require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const { createProxyMiddleware } = require("http-proxy-middleware");
const logger = require("./utils/logger");
const { port, mongoURI } = require("./config/config");
const auditRoutes = require("./routes/auditRoutes");
const footprintRoutes = require("./routes/footprintRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

app.use(
  morgan("combined", {
    skip: (req, res) => res.statusCode >= 400,
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(
  morgan("combined", {
    skip: (req, res) => res.statusCode < 400,
    stream: {
      write: (message) => logger.error(message.trim()),
    },
  })
);

app.use(
  "/report",
  createProxyMiddleware({
    target: "http://127.0.0.1:8001",
    changeOrigin: true,
  })
);

// --- API routes ---
app.use("/api", auditRoutes);
app.use("/api/v1/footprint", footprintRoutes);

// --- Serve frontend ---
app.use(express.static(path.join(__dirname, "../", "Frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../", "Frontend", "index.html"));
});
app.get("/websiteTracker", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../", "Frontend", "websiteTracker", "index.html")
  );
});

// --- Error Handling Middleware (LAST) ---
app.use((err, req, res, next) => {
  logger.error("🔥 Unhandled error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
  });
  res.status(500).json({ error: "Internal Server Error" });
});

app.use(errorHandler);

// --- Debugging Mongo URI ---
logger.debug(`DEBUG: mongoURI from config: ${mongoURI}`);
if (!mongoURI) {
  logger.error(
    "CRITICAL ERROR: MONGODB_URI is not defined in your .env file or config.js"
  );
  process.exit(1);
}

// --- Connect to MongoDB ---
mongoose
  .connect(mongoURI)
  .then(() => logger.info("✅ MongoDB connected"))
  .catch((err) =>
    logger.error(`❌ MongoDB connection error: ${err.message}`, { error: err })
  );

// --- Start Server ---
app.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port}`);
});
