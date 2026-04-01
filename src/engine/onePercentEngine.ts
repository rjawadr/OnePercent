import { Habit } from '../models/Habit';

/**
 * OnePct Engine Logic
 * Rule: Increase current target by 1% (1.01x)
 */

export const COMPOUND_RATE = 1.01;
export const REGRESSION_RATE = 0.95;

export type ImprovementFrequency = 'daily' | 'weekly' | 'monthly' | 'none';

/**
 * Calculates the multiplier for 1% compounding over a given time diff.
 */
export function getMultiplier(frequency: ImprovementFrequency, daysDiff: number): number {
  switch (frequency) {
    case 'daily':   return Math.pow(1.01, daysDiff);
    case 'weekly':  return Math.pow(1.01, daysDiff / 7);
    case 'monthly': return Math.pow(1.01, daysDiff / 30);
    case 'none':    return 1.0;
    default:        return 1.0;
  }
}

/**
 * Projection calculator for real-time card in onboarding.
 * baseline: current_target
 */
export function calculateProjections(baseline: number, frequency: ImprovementFrequency) {
  const exp: Record<ImprovementFrequency, { m: number; q: number; h: number; y: number }> = {
    daily:   { m: 30,     q: 90,    h: 180,    y: 365 },
    weekly:  { m: 30/7,   q: 90/7,  h: 180/7,  y: 365/7 },
    monthly: { m: 1,      q: 3,     h: 6,      y: 12 },
    none:    { m: 0,      q: 0,     h: 0,      y: 0 },
  };

  const e = exp[frequency];

  if (frequency === 'none') {
    return { monthly: baseline, quarterly: baseline, halfYear: baseline, yearly: baseline };
  }

  return {
    monthly:   Math.round(baseline * Math.pow(1.01, e.m)),
    quarterly: Math.round(baseline * Math.pow(1.01, e.q)),
    halfYear:  Math.round(baseline * Math.pow(1.01, e.h)),
    yearly:    Math.round(baseline * Math.pow(1.01, e.y)),
  };
}

/**
 * Rest day check (activeDays="1111100" means Mon-Fri active, Sat-Sun rest)
 */
export function isRestDay(activeDays: string, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0=Sun
  const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0
  return activeDays[idx] === '0';
}

/**
 * Rounds a value based on the unit's precision rules.
 * Prevents floating point artifacts like "5.360676760535051".
 */
export function roundForUnit(value: number, unit: string): number {
  const rules: Record<string, number> = {
    'min': 0.1,
    'minutes': 0.1,
    'kg': 0.5,
    'lbs': 0.5,
    'steps': 10,
    'km': 0.1,
    'pages': 1,
    'page': 1,
    'reps': 1,
    'seconds': 5,
    'sec': 5,
    'ml': 10,
    'oz': 0.5,
  };
  const step = rules[unit.toLowerCase()] ?? 1;
  const rounded = Math.round(value / step) * step;
  // Fix floating point artifacts: round to 1 decimal max
  return Math.round(rounded * 10) / 10;
}

export const calculateNextTarget = (currentValue: number, frequency: ImprovementFrequency = 'daily', unit: string = ''): number => {
  const multiplier = getMultiplier(frequency, 1);
  const raw = currentValue * multiplier;
  return unit ? roundForUnit(raw, unit) : Math.round(raw * 10) / 10;
};

export const calculateRegressedTarget = (currentValue: number, unit: string = ''): number => {
  const raw = currentValue * REGRESSION_RATE;
  return unit ? roundForUnit(raw, unit) : Math.round(raw * 10) / 10;
};

/**
 * Decides what the next target should be based on streaks and missed days.
 */
export const getNewTargetAfterActivity = (
  habit: Habit,
  didComplete: boolean,
  daysSinceLastLogged: number
): number => {
  if (didComplete) {
    return calculateNextTarget(habit.current_target, habit.improvement_frequency as ImprovementFrequency, habit.unit);
  }

  // Regression logic for misses (don't regress if it was a rest day)
  if (daysSinceLastLogged >= 2) {
    return calculateRegressedTarget(habit.current_target, habit.unit);
  }

  // Stay same for 1 day miss
  return habit.current_target;
};

export const formatValue = (value: number, unit: string): string => {
  // Round to 1 decimal max to avoid floating point artifacts
  const rounded = Math.round(value * 10) / 10;
  // If it's a whole number, show no decimal. Otherwise show 1 decimal.
  const display = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
  return `${display} ${unit}`;
};
