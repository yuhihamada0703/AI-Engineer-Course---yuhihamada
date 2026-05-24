import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(path.join(__dirname, 'dev.db'))

db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS columns (
    id       TEXT PRIMARY KEY,
    title    TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cards (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    column_id   TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    position    INTEGER NOT NULL DEFAULT 0
  );
`)

// Seed default data on first run
const { count } = db.prepare('SELECT COUNT(*) as count FROM columns').get() as { count: number }
if (count === 0) {
  db.prepare('INSERT INTO columns (id, title, position) VALUES (?, ?, ?)').run('col-1', 'To Do', 0)
  db.prepare('INSERT INTO columns (id, title, position) VALUES (?, ?, ?)').run('col-2', 'In Progress', 1)
  db.prepare('INSERT INTO columns (id, title, position) VALUES (?, ?, ?)').run('col-3', 'Done', 2)
  db.prepare('INSERT INTO cards (id, title, description, column_id, position) VALUES (?, ?, ?, ?, ?)').run(
    'card-1', 'サンプルタスク', 'ここにタスクの詳細を書きます', 'col-1', 0
  )
}

export default db
