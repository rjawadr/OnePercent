import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sqliteStorage } from '../db/persistence';
import { db } from '../db/client';

import { Habit } from '../models/Habit';
import { DailyLog } from '../models/DailyLog';
import { Streak } from '../models/Streak';
import { getNewTargetAfterActivity } from '../engine/onePercentEngine';
import { StreakService } from '../services/StreakService';

interface HabitState {
  habits: Habit[];
  logs: DailyLog[];
  streaks: Streak[];
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  logProgress: (habitId: string, valueAchieved: number, isCompleted: boolean) => Promise<void>;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      streaks: [],
      isInitialized: false,

      initialize: async () => {
        try {
          const habitRes = await db.executeAsync('SELECT * FROM habits');
          const habits = (habitRes.rows as any)?._array || [];
          
          const streakRes = await db.executeAsync('SELECT * FROM streaks');
          const streaks = (streakRes.rows as any)?._array || [];
          
          const logRes = await db.executeAsync('SELECT * FROM daily_logs LIMIT 100');
          const logs = (logRes.rows as any)?._array || [];

          set({ habits, streaks, logs, isInitialized: true });
        } catch (e) {
          console.error('Failed to initialize habit store:', e);
        }
      },

      addHabit: (habit) => {
        set((state) => ({ habits: [...state.habits, habit] }));
        db.executeAsync(
          'INSERT INTO habits (id, name, category, icon, color, baseline_value, current_target, unit, frequency, improvement_frequency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            habit.id, 
            habit.name, 
            habit.category ?? null, 
            habit.icon ?? null, 
            habit.color ?? null, 
            habit.baseline_value, 
            habit.current_target, 
            habit.unit, 
            habit.frequency, 
            habit.improvement_frequency
          ]
        );
      },

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      logProgress: async (habitId, valueAchieved, isCompleted) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // 1. Update Streaks in DB via Service
        const { newStreak } = await StreakService.onHabitCompleted(habitId, db);
        
        // 2. Fetch updated streaks for state
        const streakRes = await db.executeAsync('SELECT * FROM streaks');
        const streaks = (streakRes.rows as any)?._array || [];

        // 3. Calculate new target for next time
        const lastLoggedDate = habit.last_logged_at ? new Date(habit.last_logged_at) : new Date();
        const daysSince = Math.floor((now.getTime() - lastLoggedDate.getTime()) / (1000 * 3600 * 24));
        const nextTarget = getNewTargetAfterActivity(habit, isCompleted, daysSince);

        // 4. Create Log in DB
        const logId = Math.random().toString(36).substring(7);
        await db.executeAsync(
          'INSERT INTO daily_logs (id, habit_id, date, value_achieved, target_at_time, is_completed) VALUES (?, ?, ?, ?, ?, ?)',
          [logId, habitId, today, valueAchieved, habit.current_target, isCompleted ? 1 : 0]
        );

        // 5. Update Habit in DB
        await db.executeAsync(
          'UPDATE habits SET streak = ?, current_target = ?, last_logged_at = ? WHERE id = ?',
          [newStreak, nextTarget, now.toISOString(), habitId]
        );

        const newLog: DailyLog = {
          id: logId,
          habit_id: habitId,
          date: today,
          value_achieved: valueAchieved,
          target_at_time: habit.current_target,
          is_completed: isCompleted,
        };

        set((state) => ({
          logs: [...state.logs, newLog],
          streaks,
          habits: state.habits.map((h) => 
            h.id === habitId 
              ? { ...h, streak: newStreak, current_target: nextTarget, last_logged_at: now.toISOString() } 
              : h
          ),
        }));
      },
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => sqliteStorage),
    }
  )
);
