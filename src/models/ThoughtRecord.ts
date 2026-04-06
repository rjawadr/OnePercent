export type ThoughtRecordFormat = '5col' | '7col';

export interface EmotionEntry {
  name: string;
  intensity: number; // 0–100
}

export interface ThoughtRecord {
  id: string;
  session_id?: string;
  format: ThoughtRecordFormat;
  date: string;
  situation?: string;
  body_sensations?: string;
  emotions: EmotionEntry[];
  automatic_thoughts?: string;
  cognitive_distortions: string[];
  alternative_response?: string;
  ai_suggested_response?: string;
  // 7-col only
  supporting_facts?: string;
  contradicting_facts?: string;
  balanced_perspective?: string;
  post_emotions: EmotionEntry[];
  post_action?: string;
  created_at: string;
}
