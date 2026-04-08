import { ExposureStep } from '../models/ExposureStep';

export const SUDS_MASTERY_THRESHOLD = 2;
export const AGORAPHOBIA_COMPOUND_RATE = 1.01;
export const SUDS_SCALE_MAX = 10;

/**
 * Determines if a session qualifies as mastered.
 * Rule: post-session SUDS must be ≤ 2.
 */
export function isSessionMastered(postSuds: number): boolean {
  return postSuds <= SUDS_MASTERY_THRESHOLD;
}

/**
 * Computes the next difficulty value after a mastered session.
 * Applies 1% compound to the difficulty_value.
 */
export function computeNextDifficulty(currentValue: number, unit: string): number {
  const raw = currentValue * AGORAPHOBIA_COMPOUND_RATE;
  return roundDifficultyForUnit(raw, unit);
}

/**
 * Rounds difficulty to perceptually meaningful increments.
 */
export function roundDifficultyForUnit(value: number, unit: string): number {
  const rules: Record<string, number> = {
    minutes: 0.5,
    seconds: 5,
    meters: 5,
    steps: 10,
    custom: 0.1,
  };
  const step = rules[unit] ?? 0.5;
  return Math.round(value / step) * step;
}

/**
 * Determines whether a step should be unlocked.
 * Rule: previous step must be mastered twice (mastery_count >= 2).
 */
export function shouldUnlockNextStep(currentStep: ExposureStep): boolean {
  return currentStep.mastery_count >= 2;
}

/**
 * Calculates projected difficulty at various session counts.
 */
export function projectExposureDifficulty(
  currentValue: number,
  unit: string,
  _sessions?: number
) {
  const project = (n: number) =>
    roundDifficultyForUnit(currentValue * Math.pow(1.01, n), unit);
  return {
    at10: project(10),
    at30: project(30),
    at90: project(90),
    at180: project(180),
    at365: project(365),
  };
}

/**
 * Returns SUDS label for coaching copy.
 * No shame language. Forward-looking framing.
 */
export function getSUDSLabel(suds: number): string {
  if (suds <= 2) return 'Calm — Foundation solid.';
  if (suds <= 4) return 'Mild — You are holding this.';
  if (suds <= 6) return 'Moderate — Stay present. This passes.';
  if (suds <= 8) return 'High — Breathe. You have been here before.';
  return 'Intense — You are allowed to pause. Once.';
}

/**
 * Returns a short SUDS descriptor for the slider.
 */
export function getSUDSShortLabel(suds: number): string {
  const labels = [
    'None', 'Minimal', 'Mild', 'Slight', 'Noticeable',
    'Moderate', 'Significant', 'High', 'Severe', 'Extreme', 'Peak',
  ];
  return labels[Math.min(suds, 10)];
}

/**
 * Generates a coaching nudge based on pre/post SUDS delta.
 * Uses identity-first language.
 */
export function generateSessionCoachingNudge(
  preSuds: number,
  postSuds: number,
  stepName: string
): string {
  const delta = preSuds - postSuds;
  if (postSuds <= 2) {
    return `You mastered "${stepName}" — that is who you are becoming. Next session, 1% further.`;
  }
  if (delta >= 3) {
    return `SUDS dropped ${delta} points. The nervous system learns. Keep showing up.`;
  }
  if (delta >= 1) {
    return `Progress is nonlinear. That's allowed — once. Tomorrow belongs to you.`;
  }
  return `Missing once is an accident. Missing twice starts a new pattern. You know which one you are.`;
}

/**
 * Checks whether the 7-column thought record should be unlocked.
 * Threshold: 10 completed thought records.
 */
export function is7ColUnlocked(completedThoughtRecords: number): boolean {
  return completedThoughtRecords >= 10;
}

/**
 * Detects crisis-related language in free text.
 */
export const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end it', 'self-harm', "can't go on",
  'no reason to live', 'hurt myself', 'overdose', 'not worth living',
];

export function detectCrisisLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Generates a unique ID for new records.
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
