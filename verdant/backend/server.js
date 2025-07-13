// backend/server.js

require('dotenv').config(); // Load environment variables FIRST

const express = require('express');
const cors =  require('cors'); // Corrected typo here
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// Now, safely import from config.js after dotenv has run
const { port, mongoURI } = require('./websitetracker/config/config');

// Import routes for each module
const websiteTrackerRoutes = require('./websitetracker/routes/auditRoutes');
const personalTrackerRoutes = require('./personaltracker/routes/trackerRoutes'); // Make sure this file exists

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

app.use(cors());
app.use(express.json());

// Serve the static frontend files from the 'frontend' directory
// This is the crucial change to connect your frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes for each module
app.use('/api/website-tracker', websiteTrackerRoutes);
app.use('/api/personal-tracker', personalTrackerRoutes);

// Catch-all route to serve the index.html file for any non-API requests
// This ensures that direct navigation to paths like /about or /contact
// still serves your single-page application's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Main Backend Server running on http://localhost:${port}`);
});