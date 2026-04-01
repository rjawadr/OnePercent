# OnePctDiscipline

## What This Is

A premium React Native habit-tracking application designed to eliminate decision fatigue and build lasting habits through a 1% compound growth engine. It features an offline-first architecture with specialized modules for habits, agoraphobia/anxiety, gym/strength, and cardio.

## Core Value

Eliminate the "all-or-nothing" trap by focusing on 1% incremental progress, ensuring users show up even on their hardest days.

## Requirements

### Validated

- ✓ Basic React Native app structure — initialization

### Active

- [ ] Core 1% Growth Engine — compounding logic, baseline vs target
- [ ] Habit Module — onboarding, CRUD, today view, progress charts
- [ ] Agoraphobia Module — assessment, hierarchy, exposure sessions, coping tools
- [ ] SQLite Local Storage — Nitro SQLite for high-performance JSI-based persistence
- [ ] Notifee Integration — local reminders and nudges
- [ ] Design System — Brand Teal #3EC9A7, calm/anxiety-safe aesthetic

### Out of Scope

- Cloud Sync (Supabase) — Deferred to v1.1
- Friends/Social Features — Deferred to v2.0
- Web/Desktop Support — Mobile-only app

## Context

- React Native CLI (bare workflow, no Expo)
- TypeScript (strict mode)
- Zustand (state management)
- React Native Nitro SQLite (JSI-based local DB successor)
- Physically connected Android device for testing

## Constraints

- **Tech Stack**: React Native CLI + SQLite
- **Offline-first**: App must be 100% functional without internet
- **Aesthetics**: Calm UX, Brand Teal dominant, no Red-based error messaging (use Amber/Orange for warnings)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native 0.84.1 | Project already initialized with latest version | ⚠️ Revisit if native module compatibility issues arise |
| No Expo | Full control over native modules (SQLite/Notifee) | ✓ Good |
| SQLite (Nitro SQLite) | Local-first, JSI performance, successor to Quick SQLite | ✓ Good |
| 2026-03-30 | UI Tokens | Brand Teal (#3EC9A7) used as primary color; no red-based error UI. |
| 2026-03-30 | Notification Strategy | **Notifee** with database-driven triggering for local-first reliability. |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-30 after initialization*
