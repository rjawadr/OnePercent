import { ImprovementFrequency } from '../engine/onePercentEngine';

export interface Habit {
  id: string;
  name: string;
  category?: string;
  icon?: string;
  color?: string;
  
  // Compounding metrics
  baseline_value: number;
  current_target: number;
  target_value?: number; // Final milestone target (formerly goal_value)
  goal_value?: number;   // Keep for back-compat or rename
  
  unit: string;
  unit_type: 'quantity' | 'time' | 'check';
  frequency: ImprovementFrequency;
  improvement_frequency: ImprovementFrequency;
  
  // Strategy & Identity
  identity_statement?: string;
  anchor_habit?: string;
  temptation_bundle?: string;
  
  // Scheduling & UI
  notification_time: string; // HH:mm
  active_days: string;       // "1111111"
  sort_order: number;
  group_name?: string;
  habitbar_button: 'mark_done' | 'timer' | 'input';
  
  // Lifecycle
  start_date: string;
  end_date?: string;
  streak: number;
  last_logged_at?: string;
  is_active: boolean;
  created_at: string;
}
