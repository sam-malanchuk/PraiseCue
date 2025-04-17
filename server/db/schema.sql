-- Displays
CREATE TABLE IF NOT EXISTS displays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  mode TEXT CHECK(mode IN ('solo', 'follow')) NOT NULL DEFAULT 'solo',
  group_id INTEGER DEFAULT NULL,
  template TEXT DEFAULT '{}'
);

-- Songs
CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  tags TEXT,
  content TEXT NOT NULL -- Stored as JSON array of stanzas
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bible Verses
CREATE TABLE IF NOT EXISTS bible (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  UNIQUE(book, chapter, verse)
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_id INTEGER NOT NULL,
  type TEXT CHECK(type IN ('song', 'announcement', 'bible')) NOT NULL,
  item_id INTEGER NOT NULL,
  stanza_or_verse TEXT,
  position INTEGER NOT NULL,
  FOREIGN KEY(display_id) REFERENCES displays(id)
);

-- Display States (singleton)
CREATE TABLE IF NOT EXISTS active_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  content_type TEXT,
  content_id INTEGER,
  stanza_or_verse TEXT,
  target_displays TEXT,       -- JSON list of display_numbers
  target_group INTEGER        -- group_id for follow displays
);
