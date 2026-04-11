import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sqliteStorage } from '../db/persistence';
import { db } from '../db/client';
import { FearProfile } from '../models/FearProfile';
import { ExposureStep } from '../models/ExposureStep';
import { ExposureSession } from '../models/ExposureSession';
import { ThoughtRecord } from '../models/ThoughtRecord';
import {
  computeNextDifficulty,
  isSessionMastered,
  shouldUnlockNextStep,
  generateId,
} from '../engine/agoraphobiaEngine';

export interface AgoraphobiaResetEvent {
  id: string;
  step_id: string;
  timestamp: string;
  new_target: number;
  previous_target: number;
}

interface AgoraphobiaState {
  fearProfile: FearProfile | null;
  steps: ExposureStep[];
  sessions: ExposureSession[];
  thoughtRecords: ThoughtRecord[];
  resets: AgoraphobiaResetEvent[];
  activeSessionId: string | null;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  saveFearProfile: (profile: Partial<FearProfile>) => Promise<void>;
  addStep: (step: ExposureStep) => Promise<void>;
  updateStep: (id: string, updates: Partial<ExposureStep>) => Promise<void>;
  deleteStep: (id: string) => Promise<void>;
  reorderSteps: (steps: ExposureStep[]) => Promise<void>;
  startSession: (session: ExposureSession) => Promise<void>;
  updateSession: (id: string, updates: Partial<ExposureSession>) => Promise<void>;
  completeSession: (id: string, postSuds: number, notes?: string) => Promise<void>;
  abortSession: (id: string) => Promise<void>;
  saveThoughtRecord: (record: ThoughtRecord) => Promise<void>;
  updateThoughtRecord: (id: string, updates: Partial<ThoughtRecord>) => Promise<void>;
  createCustomGoalLadder: (params: {
    goalName: string;
    goalDescription: string;
    goalIcon: string;
    startingLocation: string;
    finalLocation: string;
    safetySignals: string[];
    identityStatement?: string;
    steps: Array<{
      name: string;
      location_hint: string;
      difficulty_value: number;
      initial_suds_estimate: number;
    }>;
  }) => Promise<string>;
  resetStepTarget: (stepId: string, newTarget: number) => Promise<void>;
}

export const useAgoraphobiaStore = create<AgoraphobiaState>()(
  persist(
    (set, get) => ({
      fearProfile: null,
      steps: [],
      sessions: [],
      thoughtRecords: [],
      resets: [],
      activeSessionId: null,
      isInitialized: false,

      initialize: async () => {
        try {
          // Load fear profile
          const profileRes = await db.executeAsync('SELECT * FROM fear_profiles LIMIT 1');
          const profiles = (profileRes.rows as any)?._array || [];
          const fearProfile = profiles[0]
            ? {
                ...profiles[0],
                external_signals: JSON.parse(profiles[0].external_signals || '[]'),
                internal_signals: JSON.parse(profiles[0].internal_signals || '[]'),
                feared_attacks: JSON.parse(profiles[0].feared_attacks || '[]'),
                feared_catastrophes: JSON.parse(profiles[0].feared_catastrophes || '[]'),
                onboarding_completed: !!profiles[0].onboarding_completed,
              }
            : null;

          // Load exposure steps
          const stepsRes = await db.executeAsync(
            "SELECT * FROM exposure_steps WHERE track = 'agoraphobia' ORDER BY ladder_position ASC"
          );
          const steps = ((stepsRes.rows as any)?._array || []).map((s: any) => ({
            ...s,
            safety_signals: JSON.parse(s.safety_signals || '[]'),
            is_mastered: !!s.is_mastered,
            is_unlocked: !!s.is_unlocked,
            is_active: !!s.is_active,
          }));

          // Load recent sessions
          const sessionsRes = await db.executeAsync(
            'SELECT * FROM exposure_sessions ORDER BY created_at DESC LIMIT 50'
          );
          const sessions = ((sessionsRes.rows as any)?._array || []).map((s: any) => ({
            ...s,
            suds_log: JSON.parse(s.suds_log || '[]'),
            external_signals_active: JSON.parse(s.external_signals_active || '[]'),
            internal_signals_active: JSON.parse(s.internal_signals_active || '[]'),
            safety_signals_used: JSON.parse(s.safety_signals_used || '[]'),
          }));

          // Load thought records
          const trRes = await db.executeAsync(
            'SELECT * FROM thought_records ORDER BY created_at DESC LIMIT 50'
          );
          const thoughtRecords = ((trRes.rows as any)?._array || []).map((r: any) => ({
            ...r,
            emotions: JSON.parse(r.emotions || '[]'),
            cognitive_distortions: JSON.parse(r.cognitive_distortions || '[]'),
            post_emotions: JSON.parse(r.post_emotions || '[]'),
          }));

          // Load resets
          const resetsRes = await db.executeAsync(`SELECT value FROM kv_store WHERE key = ?`, ['agoraphobia_resets']);
          const resetsRow = (resetsRes.rows as any)?._array?.[0];
          const resets = resetsRow ? JSON.parse(resetsRow.value || '[]') : [];

          // Check for active session
          const activeSession = sessions.find((s: ExposureSession) => s.status === 'in_progress');

          set({
            fearProfile,
            steps,
            sessions,
            thoughtRecords,
            resets,
            activeSessionId: activeSession?.id || null,
            isInitialized: true,
          });
        } catch (e) {
          console.error('Agoraphobia store init error:', e);
          set({ isInitialized: true });
        }
      },

      saveFearProfile: async (profile) => {
        const existing = get().fearProfile;
        const now = new Date().toISOString();
        const merged = { ...existing, ...profile, updated_at: now } as any;
        const stringify = (v: any) => JSON.stringify(v || []);

        if (existing) {
          await db.executeAsync(
            `UPDATE fear_profiles SET 
              external_signals=?, internal_signals=?, feared_attacks=?, 
              feared_catastrophes=?, emergency_contact_name=?, emergency_contact_number=?, 
              crisis_helpline_name=?, crisis_helpline_number=?, identity_statement=?, onboarding_completed=?, updated_at=? 
            WHERE id=?`,
            [
              stringify(merged.external_signals),
              stringify(merged.internal_signals),
              stringify(merged.feared_attacks),
              stringify(merged.feared_catastrophes),
              merged.emergency_contact_name ?? null,
              merged.emergency_contact_number ?? null,
              merged.crisis_helpline_name ?? null,
              merged.crisis_helpline_number ?? null,
              merged.identity_statement ?? null,
              merged.onboarding_completed ? 1 : 0,
              now,
              existing.id,
            ]
          );
        } else {
          const id = generateId();
          await db.executeAsync(
            `INSERT INTO fear_profiles (id, external_signals, internal_signals, feared_attacks, feared_catastrophes, emergency_contact_name, emergency_contact_number, crisis_helpline_name, crisis_helpline_number, identity_statement, onboarding_completed, created_at, updated_at) 
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              id,
              stringify(merged.external_signals),
              stringify(merged.internal_signals),
              stringify(merged.feared_attacks),
              stringify(merged.feared_catastrophes),
              merged.emergency_contact_name ?? null,
              merged.emergency_contact_number ?? null,
              merged.crisis_helpline_name ?? null,
              merged.crisis_helpline_number ?? null,
              merged.identity_statement ?? null,
              merged.onboarding_completed ? 1 : 0,
              now,
              now,
            ]
          );
          merged.id = id;
          merged.created_at = now;
        }
        set({ fearProfile: merged as FearProfile });
      },

      addStep: async (step) => {
        await db.executeAsync(
          `INSERT INTO exposure_steps 
            (id, track, name, description, location_hint, template_id, ladder_position, 
             initial_suds_estimate, current_difficulty, baseline_difficulty, difficulty_unit, 
             difficulty_value, safety_signals, is_unlocked) 
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            step.id,
            step.track,
            step.name,
            step.description ?? null,
            step.location_hint ?? null,
            step.template_id ?? null,
            step.ladder_position,
            step.initial_suds_estimate,
            step.current_difficulty,
            step.baseline_difficulty,
            step.difficulty_unit,
            step.difficulty_value,
            JSON.stringify(step.safety_signals),
            step.is_unlocked ? 1 : 0,
          ]
        );
        set((s) => ({ steps: [...s.steps, step] }));
      },

      updateStep: async (id, updates) => {
        const keys = Object.keys(updates);
        if (!keys.length) return;
        const processed: Record<string, any> = {};
        for (const k of keys) {
          const v = (updates as any)[k];
          processed[k] = Array.isArray(v)
            ? JSON.stringify(v)
            : typeof v === 'boolean'
            ? v
              ? 1
              : 0
            : v;
        }
        const clause = Object.keys(processed)
          .map((k) => `${k} = ?`)
          .join(', ');
        await db.executeAsync(`UPDATE exposure_steps SET ${clause} WHERE id = ?`, [
          ...Object.values(processed),
          id,
        ]);
        set((s) => ({
          steps: s.steps.map((st) => (st.id === id ? { ...st, ...updates } : st)),
        }));
      },

      deleteStep: async (id) => {
        await db.executeAsync('DELETE FROM exposure_steps WHERE id = ?', [id]);
        set((s) => ({ steps: s.steps.filter((st) => st.id !== id) }));
      },

      reorderSteps: async (steps) => {
        for (let i = 0; i < steps.length; i++) {
          await db.executeAsync('UPDATE exposure_steps SET ladder_position = ? WHERE id = ?', [
            i,
            steps[i].id,
          ]);
        }
        set({ steps: steps.map((s, i) => ({ ...s, ladder_position: i })) });
      },

      startSession: async (session) => {
        await db.executeAsync(
          `INSERT INTO exposure_sessions 
            (id, step_id, mode, status, started_at, pre_suds, difficulty_at_session,
             external_signals_active, internal_signals_active, safety_signals_used, suds_log)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [
            session.id,
            session.step_id,
            session.mode,
            session.status,
            session.started_at ?? null,
            session.pre_suds ?? null,
            session.difficulty_at_session ?? null,
            JSON.stringify(session.external_signals_active),
            JSON.stringify(session.internal_signals_active),
            JSON.stringify(session.safety_signals_used),
            JSON.stringify(session.suds_log),
          ]
        );
        set((s) => ({ sessions: [session, ...s.sessions], activeSessionId: session.id }));
      },

      updateSession: async (id, updates) => {
        const keys = Object.keys(updates);
        if (!keys.length) return;
        const processed: Record<string, any> = {};
        for (const k of keys) {
          const v = (updates as any)[k];
          processed[k] = Array.isArray(v) ? JSON.stringify(v) : v;
        }
        const clause = Object.keys(processed)
          .map((k) => `${k} = ?`)
          .join(', ');
        await db.executeAsync(`UPDATE exposure_sessions SET ${clause} WHERE id = ?`, [
          ...Object.values(processed),
          id,
        ]);
        set((s) => ({
          sessions: s.sessions.map((ss) => (ss.id === id ? { ...ss, ...updates } : ss)),
        }));
      },

      completeSession: async (id, postSuds, notes) => {
        const { steps, sessions } = get();
        const session = sessions.find((s) => s.id === id);
        if (!session) return;

        const step = steps.find((st) => st.id === session.step_id);
        if (!step) return;

        const mastered = isSessionMastered(postSuds);
        const newMasteryCount = mastered ? step.mastery_count + 1 : step.mastery_count;
        const nextDifficulty = mastered
          ? computeNextDifficulty(step.difficulty_value, step.difficulty_unit)
          : step.difficulty_value;
        const isMastered = newMasteryCount >= 2;
        const now = new Date().toISOString();

        // Calculate duration
        const startedAt = session.started_at ? new Date(session.started_at).getTime() : 0;
        const durationSeconds = startedAt
          ? Math.floor((Date.now() - startedAt) / 1000)
          : session.duration_seconds || 0;

        // Find peak SUDS from log
        const allSuds = [
          ...(session.suds_log || []).map((e) => e.suds),
          session.pre_suds ?? 0,
          postSuds,
        ];
        const peakSuds = Math.max(...allSuds);

        await db.executeAsync(
          `UPDATE exposure_sessions SET 
            status=?, ended_at=?, post_suds=?, peak_suds=?, duration_seconds=?,
            next_difficulty=?, notes=? 
          WHERE id=?`,
          ['completed', now, postSuds, peakSuds, durationSeconds, nextDifficulty, notes ?? null, id]
        );

        await db.executeAsync(
          'UPDATE exposure_steps SET mastery_count=?, is_mastered=?, difficulty_value=? WHERE id=?',
          [newMasteryCount, isMastered ? 1 : 0, nextDifficulty, step.id]
        );

        // Unlock next step if mastered
        if (shouldUnlockNextStep({ ...step, mastery_count: newMasteryCount })) {
          const nextStep = steps.find(
            (st) => st.ladder_position === step.ladder_position + 1
          );
          if (nextStep && !nextStep.is_unlocked) {
            await db.executeAsync('UPDATE exposure_steps SET is_unlocked=1 WHERE id=?', [
              nextStep.id,
            ]);
            set((s) => ({
              steps: s.steps.map((st) =>
                st.id === nextStep.id ? { ...st, is_unlocked: true } : st
              ),
            }));
          }
        }

        set((s) => ({
          activeSessionId: null,
          sessions: s.sessions.map((ss) =>
            ss.id === id
              ? {
                  ...ss,
                  status: 'completed' as const,
                  ended_at: now,
                  post_suds: postSuds,
                  peak_suds: peakSuds,
                  duration_seconds: durationSeconds,
                  next_difficulty: nextDifficulty,
                  notes: notes ?? ss.notes,
                }
              : ss
          ),
          steps: s.steps.map((st) =>
            st.id === step.id
              ? {
                  ...st,
                  mastery_count: newMasteryCount,
                  is_mastered: isMastered,
                  difficulty_value: nextDifficulty,
                }
              : st
          ),
        }));
      },

      abortSession: async (id) => {
        const now = new Date().toISOString();
        await db.executeAsync(
          'UPDATE exposure_sessions SET status=?, ended_at=? WHERE id=?',
          ['aborted', now, id]
        );
        set((s) => ({
          activeSessionId: null,
          sessions: s.sessions.map((ss) =>
            ss.id === id ? { ...ss, status: 'aborted' as const, ended_at: now } : ss
          ),
        }));
      },

      saveThoughtRecord: async (record) => {
        await db.executeAsync(
          `INSERT INTO thought_records 
            (id, session_id, format, date, situation, body_sensations, emotions,
             automatic_thoughts, cognitive_distortions, alternative_response, 
             ai_suggested_response, supporting_facts, contradicting_facts,
             balanced_perspective, post_emotions, post_action)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            record.id,
            record.session_id ?? null,
            record.format,
            record.date,
            record.situation ?? null,
            record.body_sensations ?? null,
            JSON.stringify(record.emotions),
            record.automatic_thoughts ?? null,
            JSON.stringify(record.cognitive_distortions),
            record.alternative_response ?? null,
            record.ai_suggested_response ?? null,
            record.supporting_facts ?? null,
            record.contradicting_facts ?? null,
            record.balanced_perspective ?? null,
            JSON.stringify(record.post_emotions),
            record.post_action ?? null,
          ]
        );
        set((s) => ({ thoughtRecords: [record, ...s.thoughtRecords] }));
      },

      updateThoughtRecord: async (id, updates) => {
        const processed: Record<string, any> = {};
        for (const k of Object.keys(updates)) {
          const v = (updates as any)[k];
          processed[k] = Array.isArray(v) ? JSON.stringify(v) : v;
        }
        const clause = Object.keys(processed)
          .map((k) => `${k} = ?`)
          .join(', ');
        await db.executeAsync(`UPDATE thought_records SET ${clause} WHERE id=?`, [
          ...Object.values(processed),
          id,
        ]);
        set((s) => ({
          thoughtRecords: s.thoughtRecords.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      createCustomGoalLadder: async (params) => {
        const { steps, safetySignals, identityStatement, goalName, goalIcon, goalDescription } = params;

        const newSteps: ExposureStep[] = steps.map((s, index) => ({
          id: Math.random().toString(36).substring(7),
          track: 'agoraphobia',
          name: s.name,
          description: index === 0 ? goalDescription : undefined,
          location_hint: s.location_hint || undefined,
          template_id: 'tpl_custom',
          ladder_position: index,
          initial_suds_estimate: s.initial_suds_estimate,
          current_difficulty: s.difficulty_value,
          baseline_difficulty: s.difficulty_value,
          difficulty_unit: 'meters',
          difficulty_value: s.difficulty_value,
          mastery_count: 0,
          is_mastered: false,
          is_unlocked: index === 0,
          safety_signals: safetySignals,
          is_active: true,
          created_at: new Date().toISOString(),
        }));

        for (const step of newSteps) {
          await get().addStep(step);
        }

        if (identityStatement) {
          await get().saveFearProfile({ identity_statement: identityStatement } as any);
        }

        return newSteps[0].id;
      },

      resetStepTarget: async (stepId: string, newTarget: number) => {
        const step = get().steps.find(s => s.id === stepId);
        if (!step) return;

        // 1. Update the step's difficulty_value to newTarget, resets mastery_count to 0, sets is_mastered = false.
        await get().updateStep(stepId, {
          difficulty_value: newTarget,
          mastery_count: 0,
          is_mastered: false,
        });

        // 2. Write a row to kv_store to mark the reset event.
        // E.g., push to a JSON array of reset events for the step.
        const eventId = Math.random().toString(36).substring(7);
        const resetEvent = {
          id: eventId,
          step_id: stepId,
          timestamp: new Date().toISOString(),
          new_target: newTarget,
          previous_target: step.difficulty_value,
        };

        const res = await db.executeAsync(`SELECT value FROM kv_store WHERE key = ?`, ['agoraphobia_resets']);
        const row = (res.rows as any)?._array?.[0];
        const existingResets = row ? JSON.parse(row.value || '[]') : [];
        existingResets.push(resetEvent);

        await db.executeAsync(`INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)`, [
          'agoraphobia_resets',
          JSON.stringify(existingResets),
        ]);
        
        set({ resets: existingResets });
      },
    }),
    {
      name: 'agoraphobia-storage',
      storage: createJSONStorage(() => sqliteStorage),
    }
  )
);
