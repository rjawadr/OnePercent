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

    // ═══════════════════════════════════════════════════════════════
    // AGORAPHOBIA MODULE TABLES
    // ═══════════════════════════════════════════════════════════════

    // 8. Fear Profiles (4-Component Fear Model)
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS fear_profiles (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        external_signals TEXT NOT NULL DEFAULT '[]',
        internal_signals TEXT NOT NULL DEFAULT '[]',
        feared_attacks TEXT NOT NULL DEFAULT '[]',
        feared_catastrophes TEXT NOT NULL DEFAULT '[]',
        emergency_contact_name TEXT,
        emergency_contact_number TEXT,
        crisis_helpline_name TEXT,
        crisis_helpline_number TEXT,
        onboarding_completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // 9. Exposure Steps (Ladder)
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS exposure_steps (
        id TEXT PRIMARY KEY,
        track TEXT NOT NULL DEFAULT 'agoraphobia',
        name TEXT NOT NULL,
        description TEXT,
        location_hint TEXT,
        template_id TEXT,
        ladder_position INTEGER NOT NULL DEFAULT 0,
        initial_suds_estimate INTEGER NOT NULL DEFAULT 5,
        current_difficulty REAL NOT NULL DEFAULT 1.0,
        baseline_difficulty REAL NOT NULL DEFAULT 1.0,
        difficulty_unit TEXT NOT NULL DEFAULT 'minutes',
        difficulty_value REAL NOT NULL DEFAULT 5.0,
        mastery_count INTEGER NOT NULL DEFAULT 0,
        is_mastered INTEGER NOT NULL DEFAULT 0,
        is_unlocked INTEGER NOT NULL DEFAULT 0,
        safety_signals TEXT NOT NULL DEFAULT '[]',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // 10. Exposure Sessions
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS exposure_sessions (
        id TEXT PRIMARY KEY,
        step_id TEXT NOT NULL REFERENCES exposure_steps(id) ON DELETE CASCADE,
        mode TEXT NOT NULL DEFAULT 'active',
        status TEXT NOT NULL DEFAULT 'planned',
        started_at TEXT,
        ended_at TEXT,
        duration_seconds INTEGER,
        pre_suds INTEGER,
        peak_suds INTEGER,
        post_suds INTEGER,
        suds_log TEXT NOT NULL DEFAULT '[]',
        external_signals_active TEXT NOT NULL DEFAULT '[]',
        internal_signals_active TEXT NOT NULL DEFAULT '[]',
        feared_attack_triggered TEXT,
        safety_signals_used TEXT NOT NULL DEFAULT '[]',
        notes TEXT,
        difficulty_at_session REAL,
        next_difficulty REAL,
        badge_unlocked TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // 11. Thought Records (5-col / 7-col CBT)
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS thought_records (
        id TEXT PRIMARY KEY,
        session_id TEXT REFERENCES exposure_sessions(id),
        format TEXT NOT NULL DEFAULT '5col',
        date TEXT NOT NULL,
        situation TEXT,
        body_sensations TEXT,
        emotions TEXT NOT NULL DEFAULT '[]',
        automatic_thoughts TEXT,
        cognitive_distortions TEXT NOT NULL DEFAULT '[]',
        alternative_response TEXT,
        ai_suggested_response TEXT,
        supporting_facts TEXT,
        contradicting_facts TEXT,
        balanced_perspective TEXT,
        post_emotions TEXT NOT NULL DEFAULT '[]',
        post_action TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // 12. Agoraphobia Milestones
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS agoraphobia_milestones (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        milestone_type TEXT NOT NULL,
        step_id TEXT,
        unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(milestone_type, step_id)
      );
    `);

    console.log('Database initialized and migrated successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};
