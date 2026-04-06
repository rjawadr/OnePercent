export type SessionMode = 'active' | 'retrospective';
export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'aborted';

export interface SUDSEntry {
  timestamp: string;
  suds: number;
}

export interface ExposureSession {
  id: string;
  step_id: string;
  mode: SessionMode;
  status: SessionStatus;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  pre_suds?: number;
  peak_suds?: number;
  post_suds?: number;
  suds_log: SUDSEntry[];
  external_signals_active: string[];
  internal_signals_active: string[];
  feared_attack_triggered?: string;
  safety_signals_used: string[];
  notes?: string;
  difficulty_at_session?: number;
  next_difficulty?: number;
  badge_unlocked?: string;
  created_at: string;
}
