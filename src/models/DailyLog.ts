export interface DailyLog {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  value_achieved: number;
  target_at_time: number;
  is_completed: boolean;
  notes?: string;
}
