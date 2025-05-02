const { getIO } = require('../socket');
const db = require('../db');
const getNextDisplayNumber = require('../utils/getNextDisplayNumber');

exports.getDisplays = (req, res) => {
  db.all(`SELECT * FROM displays ORDER BY id`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(r => { try { r.template = JSON.parse(r.template); } catch {} });
    res.json(rows);
  });
};

exports.createDisplay = (req, res) => {
  const { name, mode, group_id = null, template = {} } = req.body;
  getNextDisplayNumber(db, (err, display_number) => {
    if (err) return res.status(500).json({ error: err.message });
    const tpl = JSON.stringify(template);
    db.run(
      `INSERT INTO displays (display_number, name, mode, group_id, template)
       VALUES (?, ?, ?, ?, ?)`,
      [display_number, name, mode, group_id, tpl],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const created = { id: this.lastID, display_number, name, mode, group_id, template };
        getIO().emit('display-created', created);
        res.status(201).json(created);
      }
    );
  });
};

exports.deleteDisplay = (req, res) => {
  const num = parseInt(req.params.display_number, 10);
  db.run(
    `DELETE FROM displays WHERE display_number = ?`,
    [num],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      getIO().emit('display-deleted', { display_number: num });
      res.status(204).send();
    }
  );
};

exports.patchDisplay = (req, res) => {
  const num = parseInt(req.params.display_number, 10);
  const { mode, active, stanza } = req.body;

  const sets = [];
  const params = [];

  if (mode !== undefined) {
    sets.push('mode = ?');
    params.push(mode);
  }

  if (stanza !== undefined) {
    sets.push('current_stanza = CASE WHEN current_stanza = ? THEN NULL ELSE ? END');
    params.push(stanza, stanza);
  }

  if (active) {
    db.serialize(() => {
      db.run(`UPDATE displays SET active = 0`);
      db.run(`UPDATE displays SET active = 1 WHERE display_number = ?`, [num], err => {
        if (err) return res.status(500).json({ error: err.message });
        db.get(`SELECT * FROM displays WHERE display_number = ?`, [num], (e, row) => {
          if (e) return res.status(500).json({ error: e.message });
          try { row.template = JSON.parse(row.template); } catch {}
          getIO().emit('display-updated', row);
          res.json(row);
        });
      });
    });
    return;
  }

  params.push(num);
  db.run(`UPDATE displays SET ${sets.join(', ')} WHERE display_number = ?`, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get(`SELECT * FROM displays WHERE display_number = ?`, [num], (e, row) => {
      if (e) return res.status(500).json({ error: e.message });
      try { row.template = JSON.parse(row.template); } catch {}
      getIO().emit('display-updated', row);
      res.json(row);
    });
  });
};
