// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }                // allow your static host to connect
});

// JSON parsing
app.use(cors());
app.use(express.json());

// --- SQLite setup ---
const db = new sqlite3.Database('data.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS state (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// --- GET current full state ---
app.get('/api/state', (req, res) => {
  db.all("SELECT key, value FROM state", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const state = {};
    rows.forEach(r => state[r.key] = JSON.parse(r.value));
    res.json(state);
  });
});

// --- POST update one key ---
app.post('/api/state', (req, res) => {
  const { key, value } = req.body;
  const text = JSON.stringify(value);
  db.run(
    `INSERT INTO state(key, value) VALUES(?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, text],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      io.emit('field-updated', { key, value });
      res.json({ success: true });
    }
  );
});

// --- Socket.IO connection log ---
io.on('connection', socket => {
  console.log('▶️  Socket connected:', socket.id);
  socket.on('disconnect', () =>
    console.log('❌ Socket disconnected:', socket.id)
  );
});

// --- Start on 3001 ---
const PORT = 3001;
server.listen(PORT, () => console.log(`API+Socket listening on port ${PORT}`));
