const express = require('express');
const router = express.Router();
const db = require('../db/init');

// Get the next available display number
function getNextAvailableDisplayNumber(callback) {
  db.all('SELECT display_number FROM displays ORDER BY display_number ASC', [], (err, rows) => {
    if (err) return callback(err);
    const used = new Set(rows.map(r => r.display_number));
    for (let i = 1; i < 1000; i++) {
      if (!used.has(i)) return callback(null, i);
    }
    callback(null, used.size + 1);
  });
}

// Get all displays
router.get('/', (req, res) => {
  db.all('SELECT * FROM displays ORDER BY display_number ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows); // ✅ This must be an array
  });
});

// Create new display
router.post('/', (req, res) => {
  const { mode, group_id } = req.body;

  getNextAvailableDisplayNumber((err, number) => {
    if (err) return res.status(500).json({ error: err.message });

    const name = `Display ${number}`;
    const stmt = db.prepare('INSERT INTO displays (display_number, name, mode, group_id) VALUES (?, ?, ?, ?)');
    stmt.run(number, name, mode || 'solo', group_id || null, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, display_number: number });
    });
  });
});

// Update display
router.put('/:id', (req, res) => {
  const { name, mode, group_id } = req.body;
  const { id } = req.params;
  const stmt = db.prepare('UPDATE displays SET name = ?, mode = ?, group_id = ? WHERE id = ?');
  stmt.run(name, mode, group_id, id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Delete display
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM displays WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
