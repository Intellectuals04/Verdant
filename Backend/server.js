// server.js
require('dotenv').config(); // Load environment variables FIRST

const express = require('express');
const morgan = require("morgan");
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require("./utils/logger");
const { port, greenWebAPI, mongoURI } = require('./config/config');
const auditRoutes = require('./routes/auditRoutes');
const footprintRoutes = require('./routes/footprintRoutes');

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
// Proxy to FastAPI
app.use('/report', createProxyMiddleware({
  target: 'http://127.0.0.1:8001',
  changeOrigin: true
}));

// Error handling middleware (Corrected to log full error object)
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl
  });
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Debugging: Check if mongoURI is loaded ---
logger.debug(`DEBUG: mongoURI from config: ${mongoURI}`);
if (!mongoURI) {
  logger.error('CRITICAL ERROR: MONGODB_URI is not defined in your .env file or config.js');
  process.exit(1);
}
// Connect to MongoDB (Corrected to remove deprecated options)
mongoose.connect(mongoURI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => logger.error(`❌ MongoDB connection error: ${err.message}`, { error: err }));

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../', 'Frontend')));

// API routes
app.use('/api', auditRoutes);
app.use('/api/v1/footprint', footprintRoutes)
app.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port}`);
});
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'Frontend', 'index.html'));
})
app.get('/websiteTracker',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'Frontend', 'websiteTracker','index.html'));
})