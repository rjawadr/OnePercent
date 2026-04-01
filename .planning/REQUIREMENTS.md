# Requirements: OnePctDiscipline

**Defined:** 2026-03-30
**Core Value:** Eliminate the "all-or-nothing" trap by focusing on 1% incremental progress, ensuring users show up even on their hardest days.

## v1 Requirements (MVP)

Requirements for the initial release focused on the core 1% engine and primary modules.

### Habit Module (HBIT)

- [ ] **HBIT-01**: User can create, edit, and delete custom habits
- [ ] **HBIT-02**: Habit logic implements 1% compounding base on baseline ability
- [ ] **HBIT-03**: Today screen displays list of active habits with completion status
- [ ] **HBIT-04**: User can view habit-specific stats (calendar, heatmap, streaks, memos)
- [ ] **HBIT-05**: User can log progress via quantity entry or checkmark completion
- [ ] **HBIT-06**: User can see actual vs projected 1% growth curves on charts

### Agoraphobia Module (AGOR)

- [ ] **AGOR-01**: User can complete specialized 5-screen agoraphobia onboarding
- [ ] **AGOR-02**: User can build a tiered Fear Hierarchy (Low/Med/High)
- [ ] **AGOR-03**: User can run and log Exposure Sessions with SUDS ratings (0-10)
- [ ] **AGOR-04**: User can access Coping Tools (Breathing, Statements, Grounding)
- [ ] **AGOR-05**: App detects crisis-related keywords and surfaces intervention overlay

### Gym & Cardio Module (GYMC)

- [ ] **GYMC-01**: User can set up gym exercises with weight/rep baseline tracking
- [ ] **GYMC-02**: User can set up cardio goals (Steps, KM, Minutes)
- [ ] **GYMC-03**: 1% growth engine applies to weight/volume increments

### System & Infrastructure (SYST)

- [ ] **SYST-01**: High-performance SQLite persistence using Quick SQLite (JSI)
- [ ] **SYST-02**: Local notification scheduling for reminders and nudges (Notifee)
- [ ] **SYST-03**: 100% functional offline architecture (local-only data)

### UI & Design System (DSGN)

- [ ] **DSGN-01**: Implementation of "Calm/Premium" theme with Brand Teal (#3EC9A7)
- [ ] **DSGN-02**: Responsive, anxiety-safe layout with modern typography (Outfit/Inter)
- [ ] **DSGN-03**: Smooth micro-animations for progress rings and goal completion

## v2 Requirements (Deferred)

- **AUTH-01**: Cloud Sync (Supabase) for cross-device persistence
- **SOCL-01**: Accountability Friends (Accountability Partners)
- **WDGT-01**: Home Screen Widgets (iOS/Android)
- **ISLD-01**: Dynamic Island support (iOS Only)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Server-side Auth | MVP is local-only; auth deferred to v1.1 |
| Community Feed | High moderator overhead; focus on personal utility first |
| Video Lessons | Large asset size; text/simple animation sufficient for v1 |
| Web App | Core utility relies on mobile-specific patterns (notifications, local DB) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HBIT-01 | Phase 1 | Pending |
| HBIT-02 | Phase 1 | Pending |
| HBIT-03 | Phase 1 | Pending |
| HBIT-04 | Phase 2 | Pending |
| HBIT-05 | Phase 1 | Pending |
| HBIT-06 | Phase 2 | Pending |
| AGOR-01 | Phase 3 | Pending |
| AGOR-02 | Phase 3 | Pending |
| AGOR-03 | Phase 3 | Pending |
| AGOR-04 | Phase 3 | Pending |
| AGOR-05 | Phase 3 | Pending |
| GYMC-01 | Phase 4 | Pending |
| GYMC-02 | Phase 4 | Pending |
| GYMC-03 | Phase 4 | Pending |
| SYST-01 | Phase 1 | Pending |
| SYST-02 | Phase 1 | Pending |
| SYST-03 | Phase 1 | Pending |
| DSGN-01 | Phase 1 | Pending |
| DSGN-02 | Phase 1 | Pending |
| DSGN-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 after initialization*
