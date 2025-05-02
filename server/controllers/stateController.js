// server/controllers/stateController.js
const { getIO } = require('../socket');
const db = require('../db');

exports.getState = (req, res) => {
  db.all("SELECT key, value FROM state", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const state = {};
    rows.forEach(r => { state[r.key] = JSON.parse(r.value); });
    res.json(state);
  });
};

exports.updateState = (req, res) => {
  const { key, value } = req.body;
  const text = JSON.stringify(value);
  db.run(
    `INSERT INTO state(key, value) VALUES(?, ?)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, text],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      getIO().emit('field-updated', { key, value });
      res.json({ success: true });
    }
  );
};
