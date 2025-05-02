module.exports = function getNextDisplayNumber(db, cb) {
    db.all(
      `SELECT display_number FROM displays ORDER BY display_number`,
      (err, rows) => {
        if (err) return cb(err);
        const used = rows.map(r => r.display_number);
        let next = 1;
        for (const n of used) {
          if (n === next) next++;
          else break;
        }
        cb(null, next);
      }
    );
  };
  