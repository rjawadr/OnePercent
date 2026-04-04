import { open } from 'react-native-nitro-sqlite';

export const db = open({ name: 'OnePercent.sqlite' });

export const initDb = async () => {
  try {
    // 1. Core Habits Table (Base Version)
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        icon TEXT,
        color TEXT,
        baseline_value REAL NOT NULL,
        current_target REAL NOT NULL,
        goal_value REAL,
        unit TEXT NOT NULL,
        frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
        streak INTEGER DEFAULT 0,
        last_logged_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1
      );
    `);

    // 2. Daily Logs Table
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id TEXT PRIMARY KEY,
        habit_id TEXT NOT NULL,
        date TEXT NOT NULL, -- YYYY-MM-DD
        value_achieved REAL NOT NULL,
        target_at_time REAL NOT NULL,
        is_completed INTEGER DEFAULT 0,
        notes TEXT,
        FOREIGN KEY (habit_id) REFERENCES habits (id)
      );
    `);

    // 3. User Settings Table (Singleton)
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        timezone   TEXT NOT NULL DEFAULT 'UTC',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // 4. Streaks Table
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS streaks (
        id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        habit_id             TEXT NOT NULL UNIQUE REFERENCES habits(id) ON DELETE CASCADE,
        current_streak       INTEGER NOT NULL DEFAULT 0,
        longest_streak       INTEGER NOT NULL DEFAULT 0,
        freezes_available    INTEGER NOT NULL DEFAULT 0,
        last_completion_date TEXT,
        updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // 5. Badges Table
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS badges (
        id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        habit_id    TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        badge_type  TEXT NOT NULL,
        unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(habit_id, badge_type)
      );
    `);

    // 6. KV Store for App State
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // 7. Migration: Add Expanded Columns to Habits
    const columnsToAdd = [
      { name: 'unit_type', type: 'TEXT NOT NULL DEFAULT "quantity"' },
      { name: 'improvement_frequency', type: 'TEXT NOT NULL DEFAULT "daily"' },
      { name: 'target_value', type: 'REAL' },
      { name: 'identity_statement', type: 'TEXT' },
      { name: 'anchor_habit', type: 'TEXT' },
      { name: 'temptation_bundle', type: 'TEXT' },
      { name: 'notification_time', type: 'TEXT DEFAULT "08:00"' },
      { name: 'active_days', type: 'TEXT NOT NULL DEFAULT "1111111"' },
      { name: 'sort_order', type: 'INTEGER NOT NULL DEFAULT 0' },
      { name: 'group_name', type: 'TEXT' },
      { name: 'habitbar_button', type: 'TEXT NOT NULL DEFAULT "mark_done"' },
      { name: 'start_date', type: 'TEXT DEFAULT (date("now"))' },
      { name: 'end_date', type: 'TEXT' },
      { name: 'status', type: 'TEXT NOT NULL DEFAULT "active"' },
    ];

    for (const column of columnsToAdd) {
      try {
        await db.executeAsync(`ALTER TABLE habits ADD COLUMN ${column.name} ${column.type};`);
      } catch (e) {
        // Suppress "duplicate column name" error if already migrated
      }
    }

    console.log('Database initialized and migrated successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};
