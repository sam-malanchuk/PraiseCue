const express = require('express');
const router = express.Router();
const db = require('../db/init');

// Get all announcements
router.get('/', (req, res) => {
  db.all('SELECT * FROM announcements ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new announcement
router.post('/', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'Missing title or body' });
  }

  const stmt = db.prepare('INSERT INTO announcements (title, body) VALUES (?, ?)');
  stmt.run(title, body, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

module.exports = router;
