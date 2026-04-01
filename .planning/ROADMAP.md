# Roadmap: OnePctDiscipline

## Overview

A journey from a blank React Native project to a high-performance, offline-first habit transformation engine. We start with the core 1% compounding logic and habit tracking, then expand into specialized therapeutic (Agoraphobia) and physical (Gym/Cardio) modules, all while maintaining a calm, anxiety-safe premium aesthetic.

## Phases

- [ ] **Phase 1: Foundation & Habit Module Essentials** - Core infrastructure and primary habit tracking loop.
- [ ] **Phase 2: Habit Stats & Visual Feedback** - Deep analytics, 1% projection charts, and UI polish.
- [ ] **Phase 3: Agoraphobia & Anxiety Module** - Specialized therapeutic track with exposure hierarchy.
- [ ] **Phase 4: Gym & Cardio Modules** - Extension into physical fitness with weight/rep progression.
- [ ] **Phase 5: Release Refinement** - Performance tuning and final UX stabilization.

## Phase Details

### Phase 1: Foundation & Habit Module Essentials
**Goal**: Establish the "local-first" foundation and the MVP habit-tracking loop.
**Depends on**: Nothing
**Requirements**: SYST-01, SYST-02, SYST-03, HBIT-01, HBIT-02, HBIT-03, HBIT-05, DSGN-01, DSGN-02
**Success Criteria**:
  1. User can create a custom habit with emoji and name.
  2. Data persists across app restarts via SQLite.
  3. Today screen lists habits and allows logging progress (Checkmark or Quantity).
  4. 1% compounding logic calculates "Today's Target" based on baseline.
  5. Local notifications fire for daily reminders.
**Plans**: 4 plans

Plans:
- [ ] 01-01: Infrastructure (SQLite, Notifee, Zustand store)
- [ ] 01-02: Design System & Navigation (Brand Teal theme, Bottom Tabs)
- [ ] 01-03: Habit CRUD & 1% Engine (Compounding math, logic layer)
- [ ] 01-04: Home Screen (Today Tab) & Logging Flow

### Phase 2: Habit Stats & Visual Feedback
**Goal**: Provide users with deep insights and visual proof of their 1% growth.
**Depends on**: Phase 1
**Requirements**: HBIT-04, HBIT-06, DSGN-03
**Success Criteria**:
  1. Habit Detail screen displays Heatmap and Streak stats.
  2. 1% Projection chart shows Actual vs Projected trajectory.
  3. Micro-animations play upon goal completion.
  4. User can add/view Memos for each habit entry.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Habit Detail Screen & History Log
- [ ] 02-02: 1% Analytics & Visualization (Charts)

### Phase 3: Agoraphobia & Anxiety Module
**Goal**: Implement the specialized therapeutic track for anxiety management.
**Depends on**: Phase 1
**Requirements**: AGOR-01, AGOR-02, AGOR-03, AGOR-04, AGOR-05
**Success Criteria**:
  1. User completes the 5-screen psychologist-designed onboarding.
  2. User can build and manage a 3-tier Fear Hierarchy.
  3. Exposure sessions correctly track SUDS (Subjective Units of Distress).
  4. Coping tools (Breathing, Grounding) are accessible during sessions.
  5. Crisis overlay triggers locally on dangerous keyword detection.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Agora Onboarding & Hierarchy Builder
- [ ] 03-02: Exposure Session Engine & Logger
- [ ] 03-03: Coping Tools Library & Crisis Detection

### Phase 4: Gym & Cardio Modules
**Goal**: Extend the 1% engine to specific physical fitness tracking.
**Depends on**: Phase 1
**Requirements**: GYMC-01, GYMC-02, GYMC-03
**Success Criteria**:
  1. User can track gym exercises with weight/rep progression.
  2. User can track cardio goals in Steps/KM/Minutes.
  3. Physical stats integrate with the overall 1% trend.
**Plans**: 1 plan

Plans:
- [ ] 04-01: Gym & Cardio Module Implementation

### Phase 5: Release Refinement
**Goal**: Ensure production-grade stability and performance.
**Depends on**: Phase 4
**Requirements**: All v1.0
**Success Criteria**:
  1. No frame drops during transitions on physical device.
  2. SQLite queries optimized for large datasets.
  3. All edge cases (missed days, leap years) handled by engine.
**Plans**: 1 plan

Plans:
- [ ] 05-01: Performance Audit & Final UX Polish

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Habits | 0/4 | Not started | - |
| 2. Stats & Charts | 0/2 | Not started | - |
| 3. Agoraphobia | 0/3 | Not started | - |
| 4. Gym & Cardio | 0/1 | Not started | - |
| 5. Polish | 0/1 | Not started | - |
