import Database from "bun:sqlite"
import { join } from "path"
import { readFileSync } from "fs"

export const db = new Database(join(import.meta.dir, "../stylequest.sqlite"), { create: true })

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    xp_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_winstreak INTEGER DEFAULT 0,
    longest_winstreak INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_streak_date DATE
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    exercise_id TEXT,
    xp_gained INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS level_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    previous_level INTEGER,
    new_level INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

try {
  const initSql = readFileSync(join(import.meta.dir, "db.sql"), "utf-8")
  db.exec(initSql)
} catch {}
