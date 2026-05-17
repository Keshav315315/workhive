const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow all origins (required for Railway + any external clients)
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));

app.use(express.json());

// Prevent browsers from caching API responses (fixes 304 stale-auth issues)
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server running' }));

// Serve React frontend
const frontendDist = path.join(__dirname, 'public');
app.use(express.static(frontendDist, { index: 'index.html' }));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Start server immediately — don't wait for DB
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

// Connect to MongoDB separately so a slow DB doesn't block startup
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    // Don't exit — let Railway health check pass; DB may recover
  });
