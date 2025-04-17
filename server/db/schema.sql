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
  content TEXT NOT NULL -- Stored in markdown-style blocks
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bible Cache (optional, if you store fetched text)
CREATE TABLE IF NOT EXISTS bible_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT,
  reference TEXT, -- e.g. "John 3:16"
  content TEXT,
  UNIQUE(version, reference)
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_id INTEGER,
  type TEXT CHECK(type IN ('song', 'announcement', 'bible')) NOT NULL,
  item_id INTEGER,
  position INTEGER,
  FOREIGN KEY(display_id) REFERENCES displays(id)
);

-- Display States (what’s currently shown)
CREATE TABLE IF NOT EXISTS active_content (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- force singleton
  content_type TEXT,
  content_id INTEGER,
  stanza_or_verse TEXT,
  display_group_id INTEGER
);
