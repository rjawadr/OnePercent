import { format, differenceInCalendarDays } from 'date-fns';

export class BadgeService {
  static MILESTONES = [7, 14, 30, 60, 90, 180, 365];

  static async checkAndAward(habitId: string, streak: number, db: any): Promise<string | null> {
    if (!this.MILESTONES.includes(streak)) return null;
    const badgeType = `${streak}_days`;
    try {
      await db.executeAsync(
        'INSERT OR IGNORE INTO badges (habit_id, badge_type) VALUES (?, ?)',
        [habitId, badgeType]
      );
      return badgeType;
    } catch (e) {
      console.error('Error awarding badge:', e);
      return null;
    }
  }
}

export class StreakService {
  static async onHabitCompleted(habitId: string, db: any): Promise<{
    newStreak: number;
    badgeUnlocked: string | null;
    freezeEarned: boolean;
  }> {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Nitro SQLite: executeAsync returns { rows: AnyArray }
    const result = await db.executeAsync(
      'SELECT * FROM streaks WHERE habit_id = ?', [habitId]
    );

    const rows = (result.rows as any)?._array || [];
    const streak = rows.length > 0 ? rows[0] : null;

    if (!streak) {
      // First ever completion
      await db.executeAsync(
        'INSERT INTO streaks (habit_id, current_streak, longest_streak, last_completion_date) VALUES (?, 1, 1, ?)',
        [habitId, today]
      );
      return { newStreak: 1, badgeUnlocked: null, freezeEarned: false };
    }

    const lastDate = streak.last_completion_date;
    const daysDiff = lastDate
      ? differenceInCalendarDays(new Date(today), new Date(lastDate))
      : null;

    let newStreak = streak.current_streak;

    if (daysDiff === 1) {
      // Consecutive day
      newStreak = streak.current_streak + 1;
    } else if (daysDiff === 0) {
      // Same day completion, keep streak
      newStreak = streak.current_streak;
    } else {
      // Missed day(s), reset streak to 1
      newStreak = 1;
    }

    const longest = Math.max(newStreak, streak.longest_streak);
    const freezeEarned = newStreak % 7 === 0 && newStreak > streak.current_streak;

    await db.executeAsync(
      `UPDATE streaks SET 
        current_streak = ?, longest_streak = ?, last_completion_date = ?,
        freezes_available = freezes_available + ?, updated_at = datetime('now')
       WHERE habit_id = ?`,
      [newStreak, longest, today, freezeEarned ? 1 : 0, habitId]
    );

    // Check badges
    const badge = await BadgeService.checkAndAward(habitId, newStreak, db);

    return { newStreak, badgeUnlocked: badge, freezeEarned };
  }
}
