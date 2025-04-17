const express = require('express');
const router = express.Router();
const db = require('../db/init');

// Save schedule (overwrites old one)
router.post('/:displayId', (req, res) => {
  const { displayId } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid format: items should be an array' });
  }

  db.serialize(() => {
    db.run('DELETE FROM schedules WHERE display_id = ?', [displayId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      const stmt = db.prepare(`
        INSERT INTO schedules
          (display_id, type, item_id, stanza_or_verse, position)
        VALUES (?, ?, ?, ?, ?)
      `);
      items.forEach((item, idx) => {
        stmt.run(
          displayId,
          item.type,
          item.item_id,
          item.stanza_or_verse || null,
          idx
        );
      });
      stmt.finalize((err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true });
      });
    });
  });
});

// Get schedule for display
router.get('/:displayId', (req, res) => {
  const { displayId } = req.params;
  db.all(
    `SELECT id, display_id, type, item_id, stanza_or_verse, position
     FROM schedules WHERE display_id = ? ORDER BY position ASC`,
    [displayId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
