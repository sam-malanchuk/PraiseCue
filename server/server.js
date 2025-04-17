const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const songsRouter = require('./routes/songs');
const announcementsRouter = require('./routes/announcements');
const schedulesRouter = require('./routes/schedules');
const displaysRouter = require('./routes/displays');

const db = require('./db/init'); // Ensure schema is initialized
const registerSocketHandlers = require('./socket'); // Will be created next

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Static frontend build (when deployed)
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use('/api/songs', songsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/displays', displaysRouter);

// Socket.IO
io.on('connection', (socket) => {
  console.log('New socket connected:', socket.id);
  registerSocketHandlers(socket, io, db);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
