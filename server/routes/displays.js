const express = require('express');
const router = express.Router();
const db = require('../db/init');

// Get all displays
router.get('/', (req, res) => {
  db.all(
    `SELECT id, display_number, name, mode, group_id, template
     FROM displays ORDER BY display_number ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get single display by display_number
router.get('/:id', (req, res) => {
  const displayNum = req.params.id;
  db.get(
    `SELECT id, display_number, name, mode, group_id as groupId, template
     FROM displays WHERE display_number = ?`,
    [displayNum],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Display not found' });
      res.json(row);
    }
  );
});

// Create new display
router.post('/', (req, res) => {
  // defensive default when no JSON body is sent
  const { mode = 'solo', groupId = null, template = {} } = req.body || {};
  // Determine next available display_number
  db.all('SELECT display_number FROM displays ORDER BY display_number ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const used = new Set(rows.map(r => r.display_number));
    let number = 1;
    while (used.has(number)) number++;

    const name = `Display ${number}`;
    const stmt = db.prepare(
      `INSERT INTO displays
       (display_number, name, mode, group_id, template)
       VALUES (?, ?, ?, ?, ?)`
    );
    stmt.run(number, name, mode, groupId, JSON.stringify(template), function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: this.lastID,
        display_number: number,
        name,
        mode,
        groupId,
        template
      });
    });
  });
});

// Update display (name, mode, groupId, template)
router.put('/:id', (req, res) => {
  const displayNum = req.params.id;
  const { name, mode, groupId = null, template } = req.body;
  const updates = [];
  const params = [];
  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (mode !== undefined) { updates.push('mode = ?'); params.push(mode); }
  if (req.body.hasOwnProperty('groupId')) { updates.push('group_id = ?'); params.push(groupId); }
  if (template !== undefined) { updates.push('template = ?'); params.push(JSON.stringify(template)); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const sql = `UPDATE displays SET ${updates.join(', ')} WHERE display_number = ?`;
  params.push(displayNum);
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Delete display
router.delete('/:id', (req, res) => {
  const displayNum = req.params.id;
  db.run(
    'DELETE FROM displays WHERE display_number = ?',
    [displayNum],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

module.exports = router;
