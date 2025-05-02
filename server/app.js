const express = require('express');
const cors = require('cors');
const path = require('path');

const stateRoutes = require('./routes/state');
const displayRoutes = require('./routes/displays');

const app = express();
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/state', stateRoutes);
app.use('/api/displays', displayRoutes);

// Serve React build
app.use(express.static(path.join(__dirname, '../client/build')));
// option A – regex catch-all
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


module.exports = app;
