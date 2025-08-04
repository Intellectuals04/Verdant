require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const { port, greenWebAPI, mongoURI } = require('./config/config');
const auditRoutes = require('./routes/auditRoutes');

console.log('DEBUG: mongoURI from config:', mongoURI);
if (!mongoURI) {
    console.error('CRITICAL ERROR: MONGODB_URI is not defined in your .env file or config.js');
    process.exit(1); 
}
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message)); // Log only the message for clarity

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '../', 'verdant', 'frontend');
app.use(express.static(frontendPath));

app.use('/api', auditRoutes);

const mainPages = ['/', '/home', '/about', '/contact', '/faq', '/login', '/register'];
const trackerPages = {
    website: ['/', '/home'],
    personal: ['/', '/energy', '/food', '/shopping', '/transport']
};

// Route for the root and other main pages
app.get(mainPages, (req, res) => {
    // The base path is always the frontend directory
    const filePath = req.path === '/' || req.path === '/home' ? 'index.html' : `${req.path.substring(1)}.html`;
    res.sendFile(path.join(frontendPath, filePath));
});

// Route for the website tracker pages
app.get('/websiteTracker' + trackerPages.website.join('|/websiteTracker'), (req, res) => {
    res.sendFile(path.join(frontendPath, 'websiteTracker', 'index.html'));
});

// Route for the personal tracker pages
app.get('/personalTracker' + trackerPages.personal.join('|/personalTracker'), (req, res) => {
    let filePath;
    // Handle the base URL for the personal tracker
    if (req.path === '/personalTracker') {
        filePath = 'index.html';
    } else {
        // Handle sub-pages like /personalTracker/energy
        filePath = `public/${req.path.split('/').pop()}.html`;
    }
    res.sendFile(path.join(frontendPath, 'personalTracker', filePath));
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
