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
const errorHandler = require("./middlewares/errorHandler");


app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
// Global error handler (last middleware)
app.use(errorHandler);
// Proxy to FastAPI
app.use('/report', createProxyMiddleware({
  target: 'http://127.0.0.1:8001',
  changeOrigin: true
}));
// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.message} - ${req.originalUrl}`);
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Debugging: Check if mongoURI is loaded ---
logger.debug(`DEBUG: mongoURI from config: ${mongoURI}`);
if (!mongoURI) {
  logger.error('CRITICAL ERROR: MONGODB_URI is not defined in your .env file or config.js');
  process.exit(1); 
}
// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => logger.error(`❌ MongoDB connection error: ${err.message}`));

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../', 'verdant', 'frontend')));

// API routes
app.use('/api', auditRoutes);
app.use('/api/v1/footprint', footprintRoutes)
app.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port}`);
});
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'verdant', 'frontend', 'index.html'));
})
app.get('/websiteTracker',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'verdant', 'frontend', 'websiteTracker','index.html'));
})
/* app.get('/personalTracker',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'verdant', 'frontend', 'personalTracker','index.html'));
})
app.get('/personalTracker/energy',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'verdant', 'frontend', 'personalTracker','public','energy.html'));
})
app.get('/personalTracker/food',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'verdant', 'frontend', 'personalTracker','public','food.html'));
})
app.get('/personalTracker/shopping',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'verdant', 'frontend', 'personalTracker','public','shopping.html'));
})
app.get('/personalTracker/transport',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'verdant', 'frontend', 'personalTracker','public','transport.html'));
}) */