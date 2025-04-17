const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'praisecue.sqlite');

// 🔥 Delete old database
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Existing database deleted.');
}

// 💾 Create new DB instance
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Could not open database', err);
  } else {
    console.log('SQLite database loaded at', DB_PATH);
  }
});

// 📜 Load and run schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

db.exec(schemaSQL, (err) => {
  if (err) {
    console.error('Error running schema.sql:', err.message);
  } else {
    console.log('Database schema initialized.');
  }
});

module.exports = db;
