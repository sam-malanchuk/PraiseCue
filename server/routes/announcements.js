const express = require('express');
const router = express.Router();
const db = require('../db/init');

// Get all announcements
router.get('/', (req, res) => {
  db.all(
    'SELECT id, title, body, created_at FROM announcements ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Add new announcement
router.post('/', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'Missing title or body' });
  }

  const stmt = db.prepare('INSERT INTO announcements (title, body) VALUES (?, ?)');
  stmt.run(title, body, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get(
      'SELECT id, title, body, created_at FROM announcements WHERE id = ?',
      [this.lastID],
      (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(row);
      }
    );
  });
});

module.exports = router;
