export type DifficultyUnit = 'minutes' | 'meters' | 'steps' | 'seconds' | 'custom';

export interface ExposureStep {
  id: string;
  track: string;
  name: string;
  description?: string;
  location_hint?: string;
  template_id?: string;
  ladder_position: number;
  initial_suds_estimate: number;
  current_difficulty: number;
  baseline_difficulty: number;
  difficulty_unit: DifficultyUnit;
  difficulty_value: number;
  mastery_count: number;
  is_mastered: boolean;
  is_unlocked: boolean;
  safety_signals: string[];
  is_active: boolean;
  created_at: string;
}
