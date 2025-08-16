// utils/logger.js
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// Create logger instance
const logger = createLogger({
  level: "info", // default log level (can be debug, error, warn, info)
  format: combine(
    colorize(),   // colorized logs for console
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new transports.Console(), // log to console
    new transports.File({ filename: "logs/error.log", level: "error" }), // only errors
    new transports.File({ filename: "logs/combined.log" }) // all logs
  ],
});

module.exports = logger;