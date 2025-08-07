// server.js
require('dotenv').config(); // Load environment variables FIRST

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy to FastAPI
app.use('/report', createProxyMiddleware({
  target: 'http://127.0.0.1:8001',
  changeOrigin: true
}));


// Now, safely import from config.js after dotenv has run
const { port, greenWebAPI, mongoURI } = require('./config/config');
const auditRoutes = require('./routes/auditRoutes');

// --- Debugging: Check if mongoURI is loaded ---
console.log('DEBUG: mongoURI from config:', mongoURI);
if (!mongoURI) {
    console.error('CRITICAL ERROR: MONGODB_URI is not defined in your .env file or config.js');
    process.exit(1); // Exit the process if URI is missing
}
// ---------------------------------------------


// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message)); // Log only the message for clarity

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../', 'verdant', 'frontend')));

// API routes
app.use('/api', auditRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'verdant', 'frontend', 'index.html'));
})
app.get('/websiteTracker',(req,res)=>{
  res.sendFile(path.join(__dirname, '../', 'verdant', 'frontend', 'websiteTracker','index.html'));
})
app.get('/personalTracker',(req,res)=>{
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
})