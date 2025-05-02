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
  const { mode } = req.body;
  db.run(
    `UPDATE displays SET mode = ? WHERE display_number = ?`,
    [mode, num],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      db.get(
        `SELECT * FROM displays WHERE display_number = ?`,
        [num],
        (err, row) => {
          if (err) return console.error(err);
          try { row.template = JSON.parse(row.template); } catch {}
          getIO().emit('display-updated', row);
          res.json(row);
        }
      );
    }
  );
};
