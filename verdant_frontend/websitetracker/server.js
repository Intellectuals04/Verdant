const express = require('express');
const cors = require('cors');
const path = require('path'); // Add this to work with file paths
const app = express();
const { port } = require('./config/config');
const auditRoutes = require('./routes/auditRoutes');

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
// This line should ideally be before other routes if you want
// it to serve index.html for the root path by default.
app.use(express.static(path.join(__dirname, 'public'))); // Using path.join for better path resolution

// API routes
app.use('/api', auditRoutes);

// Optional: If you want to explicitly serve index.html for the root,
// and ensure it's picked up even if other static files exist,
// you can do this, but `express.static` usually handles it automatically
// for 'index.html' within the static directory.
// If you remove the `app.get('/')` above, express.static('public') will
// automatically serve public/index.html when accessing /.
// So, you don't *need* this specific route if `express.static` is correctly configured.
/*
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
*/

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});