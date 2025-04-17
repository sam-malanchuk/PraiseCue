const express = require('express');
const router = express.Router();
const db = require('../db/init');

// Save schedule (overwrites old one)
router.post('/:displayId', (req, res) => {
  const { displayId } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid format' });
  }

  db.serialize(() => {
    db.run('DELETE FROM schedules WHERE display_id = ?', [displayId]);

    const stmt = db.prepare(
      'INSERT INTO schedules (display_id, type, item_id, position) VALUES (?, ?, ?, ?)'
    );

    items.forEach((item, idx) => {
      stmt.run(displayId, item.type, item.item_id, idx);
    });

    stmt.finalize();
    res.json({ success: true });
  });
});

// Load schedule
router.get('/:displayId', (req, res) => {
  const { displayId } = req.params;

  db.all(
    'SELECT * FROM schedules WHERE display_id = ? ORDER BY position ASC',
    [displayId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
