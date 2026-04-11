export interface FearProfile {
  id: string;
  external_signals: string[];
  internal_signals: string[];
  feared_attacks: string[];
  feared_catastrophes: string[];
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  crisis_helpline_name?: string;
  crisis_helpline_number?: string;
  identity_statement?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
