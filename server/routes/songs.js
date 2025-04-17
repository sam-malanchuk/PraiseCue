const express = require('express');
const router = express.Router();
const db = require('../db/init');

// Get all songs
router.get('/', (req, res) => {
  db.all('SELECT id, title, tags FROM songs ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get full song by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM songs WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Save parsed song
router.post('/', (req, res) => {
  const { title, stanzas, tags } = req.body;

  if (!title || !stanzas) {
    return res.status(400).json({ error: 'Missing title or stanzas' });
  }

  const content = JSON.stringify(stanzas); // stored as JSON
  const tagString = tags?.join(',') || '';

  const stmt = db.prepare('INSERT INTO songs (title, tags, content) VALUES (?, ?, ?)');
  stmt.run(title, tagString, content, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

module.exports = router;
