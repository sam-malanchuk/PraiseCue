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
  const { mode, active, songId, stanza } = req.body;
  const sets = [];
  const params = [];

  if (mode !== undefined) {
    sets.push('mode = ?');
    params.push(mode);
  }
  if (songId !== undefined) {
    // switch song and clear stanza
    sets.push('current_song_id = ?', 'current_stanza = NULL');
    params.push(songId);
  }
  if (stanza !== undefined) {
    sets.push(
      'current_stanza = CASE WHEN current_stanza = ? THEN NULL ELSE ? END'
    );
    params.push(stanza, stanza);
  }

  // Activation case:
  if (active) {
    // 1) find old active
    db.get(
      `SELECT display_number FROM displays WHERE active = 1`,
      (err, prev) => {
        if (err) return res.status(500).json({ error: err.message });
        const prevNum = prev?.display_number;

        // 2) deactivate all
        db.run(`UPDATE displays SET active = 0`);

        // 3) activate the new one
        db.run(
          `UPDATE displays SET active = 1 WHERE display_number = ?`,
          [num],
          err2 => {
            if (err2) return res.status(500).json({ error: err2.message });

            // 4) fetch & emit new active
            db.get(
              `SELECT * FROM displays WHERE display_number = ?`,
              [num],
              (e, newRow) => {
                if (e) return res.status(500).json({ error: e.message });
                try { newRow.template = JSON.parse(newRow.template) } catch {}
                getIO().emit('display-updated', newRow);

                // 5) fetch & emit old active (if any)
                if (prevNum) {
                  db.get(
                    `SELECT * FROM displays WHERE display_number = ?`,
                    [prevNum],
                    (e2, oldRow) => {
                      if (!e2) {
                        try { oldRow.template = JSON.parse(oldRow.template) } catch {}
                        getIO().emit('display-updated', oldRow);
                      }
                    }
                  );
                }

                // 6) respond with the new active
                res.json(newRow);
              }
            );
          }
        );
      }
    );
    return;
  }

  // Non-activation updates (mode/song/stanza)
  
  params.push(num);
  db.run(
    `UPDATE displays SET ${sets.join(', ')} WHERE display_number = ?`,
    params,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // if this display is in follow-mode, propagate to all follow displays
      db.get(
        `SELECT mode, current_song_id, current_stanza FROM displays WHERE display_number = ?`,
        [num],
        (e, row) => {
          if (e) return console.error(e);
          if (row.mode === 'follow') {
            // update every follow-mode display to the same songId & stanza
            db.run(
              `UPDATE displays 
                 SET current_song_id = ?, current_stanza = ?
               WHERE mode = 'follow'`,
              [row.current_song_id, row.current_stanza || null],
              err2 => {
                if (err2) console.error(err2);
                // emit updates for all follow displays
                db.all(`SELECT * FROM displays WHERE mode='follow'`, (e2, all) => {
                  all.forEach(d => {
                    try { d.template = JSON.parse(d.template) } catch {}
                    getIO().emit('display-updated', d);
                  });
                });
              }
            );
          } else {
            // just emit the single updated row
            getIO().emit('display-updated', { ...row, display_number: num });
          }
        }
      );

      // final response: return the updated row
      db.get(`SELECT * FROM displays WHERE display_number = ?`, [num], (e3, updated) => {
        if (e3) return res.status(500).json({ error: e3.message });
        res.json(updated);
      });
    }
  );
};
