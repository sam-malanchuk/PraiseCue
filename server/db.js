const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS displays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      display_number INTEGER UNIQUE,
      name TEXT,
      mode TEXT,
      group_id INTEGER,
      template TEXT
    );
  `);
});

module.exports = db;
