const logger = require("../utils/logger");

// Global Error Handler Middleware
function errorHandler(err, req, res, next) {
  // Log full error details
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Optional: log stack trace only in dev mode
  if (process.env.NODE_ENV !== "production") {
    logger.error(err.stack);
  }

  // Default status code
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}

module.exports = errorHandler;
