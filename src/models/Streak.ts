export interface Streak {
  id: string;
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  freezes_available: number;
  last_completion_date: string | null;
  updated_at: string;
}
