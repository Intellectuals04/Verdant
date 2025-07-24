// server.js
require('dotenv').config(); // Load environment variables FIRST

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

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

app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', auditRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});