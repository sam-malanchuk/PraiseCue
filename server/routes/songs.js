const express = require('express');
const router = express.Router();
const db = require('../db/init');

// Get all songs (summary)
router.get('/', (req, res) => {
  db.all('SELECT id, title, tags FROM songs ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse tags JSON
    const songs = rows.map(row => ({
      id: row.id,
      title: row.title,
      tags: JSON.parse(row.tags || '[]')
    }));
    res.json(songs);
  });
});

// Get full song by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT id, title, tags, content FROM songs WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Song not found' });
    // Parse tags and content JSON
    const song = {
      id: row.id,
      title: row.title,
      tags: JSON.parse(row.tags || '[]'),
      content: JSON.parse(row.content)
    };
    res.json(song);
  });
});

// Add new song
router.post('/', (req, res) => {
  const { title, tags, content } = req.body;
  if (!title || !Array.isArray(content) || content.length === 0) {
    return res.status(400).json({ error: 'Missing title or content array' });
  }
  // Validate stanzas
  for (const stanza of content) {
    if (!stanza.title || !Array.isArray(stanza.lines)) {
      return res.status(400).json({ error: 'Invalid stanza format' });
    }
  }

  const tagsString = JSON.stringify(tags || []);
  const contentString = JSON.stringify(content);

  const stmt = db.prepare('INSERT INTO songs (title, tags, content) VALUES (?, ?, ?)');
  stmt.run(title, tagsString, contentString, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

module.exports = router;
