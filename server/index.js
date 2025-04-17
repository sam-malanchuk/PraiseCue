// server/index.js
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const socketSetup = require('./socket');
const db = require('./db');

// Load .env config
dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (placeholder for now)
// const apiRoutes = require('./routes/api');
// app.use('/api', apiRoutes);

// Static Files for Production
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Init DB and Sockets
db.init();
socketSetup(io);

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
