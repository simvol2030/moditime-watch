-- Migration 006: pSEO Schema (Session-6)
-- Run this on production DB BEFORE deploying new code

-- Task 1: ALTER city_articles — add SEO columns
ALTER TABLE city_articles ADD COLUMN meta_title TEXT;
ALTER TABLE city_articles ADD COLUMN meta_description TEXT;
ALTER TABLE city_articles ADD COLUMN category_id INTEGER REFERENCES city_article_categories(id) ON DELETE SET NULL;
ALTER TABLE city_articles ADD COLUMN read_time INTEGER;

CREATE INDEX IF NOT EXISTS idx_city_articles_category ON city_articles(category_id);

-- Task 2: city_article_categories
CREATE TABLE IF NOT EXISTS city_article_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Task 3: city_article_tags + relations
CREATE TABLE IF NOT EXISTS city_article_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS city_article_tag_relations (
  article_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES city_articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES city_article_tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_city_article_tag_relations_tag ON city_article_tag_relations(tag_id);

-- Task 4: city_article_related
CREATE TABLE IF NOT EXISTS city_article_related (
  article_id INTEGER NOT NULL,
  related_article_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (article_id, related_article_id),
  FOREIGN KEY (article_id) REFERENCES city_articles(id) ON DELETE CASCADE,
  FOREIGN KEY (related_article_id) REFERENCES city_articles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_city_article_related_related ON city_article_related(related_article_id);

-- Task 5: city_article_media
CREATE TABLE IF NOT EXISTS city_article_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES city_articles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_city_article_media_article ON city_article_media(article_id, position);

-- Task 7: FTS5
CREATE VIRTUAL TABLE IF NOT EXISTS city_articles_fts USING fts5(
  title, excerpt, content,
  content=city_articles, content_rowid=id
);

CREATE TRIGGER IF NOT EXISTS city_articles_fts_insert AFTER INSERT ON city_articles BEGIN
  INSERT INTO city_articles_fts(rowid, title, excerpt, content) VALUES (new.id, new.title, new.excerpt, new.content);
END;

CREATE TRIGGER IF NOT EXISTS city_articles_fts_update AFTER UPDATE ON city_articles BEGIN
  INSERT INTO city_articles_fts(city_articles_fts, rowid, title, excerpt, content) VALUES ('delete', old.id, old.title, old.excerpt, old.content);
  INSERT INTO city_articles_fts(rowid, title, excerpt, content) VALUES (new.id, new.title, new.excerpt, new.content);
END;

CREATE TRIGGER IF NOT EXISTS city_articles_fts_delete AFTER DELETE ON city_articles BEGIN
  INSERT INTO city_articles_fts(city_articles_fts, rowid, title, excerpt, content) VALUES ('delete', old.id, old.title, old.excerpt, old.content);
END;

-- Backfill FTS5 index with existing data
INSERT INTO city_articles_fts(rowid, title, excerpt, content)
  SELECT id, title, excerpt, content FROM city_articles;
