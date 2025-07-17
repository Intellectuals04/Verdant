require('dotenv').config(); 

const express = require('express');
const cors =  require('cors'); 
const path = require('path');
const mongoose = require('mongoose');
const app = express();

const { port, mongoURI } = require('./websitetracker/config/config');

// Import routes for each module
const websiteTrackerRoutes = require('./websitetracker/routes/auditRoutes');

// const personalTrackerRoutes = require('./personaltracker/routes/trackerRoutes'); 

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/website-tracker', websiteTrackerRoutes);

// app.use('/api/personal-tracker', personalTrackerRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Main Backend Server running on http://localhost:${port}`);
});
