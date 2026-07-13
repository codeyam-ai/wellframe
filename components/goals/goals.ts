// Pure, client-safe helpers for the Goals surface. Progress math and the
// progress-ring geometry live here so they can be unit-tested without a DB or
// the DOM, and pulled into the client bundle.

export type GoalStatus = 'complete' | 'active';

export const GOAL_RING_RADIUS = 26;

export const GOAL_CATEGORIES = [
  'distance',
  'race',
  'sleep',
  'strength',
  'habit',
  'recovery',
] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export interface GoalDraft {
  title: string;
  category: string;
  metric: string;
  target: number;
  current: number;
  unit?: string;
  cadence?: string;
}

export type GoalValidation =
  | { ok: true; value: GoalDraft }
  | { ok: false; error: string };

// Validate + normalize a new-goal form submission. Pure so the create form and
// the server action share one source of truth and it's unit-testable. Trims
// text, defaults an unknown category to "habit", coerces numeric fields, and
// rejects an empty title or a non-positive target.
export function validateGoalInput(raw: {
  title?: string;
  category?: string;
  metric?: string;
  target?: number | string;
  current?: number | string;
  unit?: string;
  cadence?: string;
}): GoalValidation {
  const title = (raw.title ?? '').trim();
  if (!title) return { ok: false, error: 'Give the goal a title.' };

  const target = Number(raw.target);
  if (!Number.isFinite(target) || target <= 0) {
    return { ok: false, error: 'Target must be a number greater than 0.' };
  }

  const currentRaw = Number(raw.current ?? 0);
  const current = Number.isFinite(currentRaw) ? Math.max(0, currentRaw) : 0;

  const category = (GOAL_CATEGORIES as readonly string[]).includes(
    raw.category ?? '',
  )
    ? (raw.category as GoalCategory)
    : 'habit';

  return {
    ok: true,
    value: {
      title,
      category,
      metric: (raw.metric ?? '').trim() || 'Progress',
      target,
      current,
      unit: (raw.unit ?? '').trim() || undefined,
      cadence: (raw.cadence ?? '').trim() || undefined,
    },
  };
}

// Fraction complete, clamped to [0, 100]. A zero or negative target degrades to
// 0% rather than dividing by zero or reporting Infinity. NaN inputs → 0.
export function progressPct(current: number, target: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
    return 0;
  }
  const pct = (current / target) * 100;
  if (Number.isNaN(pct)) return 0;
  return Math.max(0, Math.min(100, pct));
}

// A goal is complete once current reaches (or passes) its target.
export function goalStatus(current: number, target: number): GoalStatus {
  if (Number.isFinite(current) && Number.isFinite(target) && target > 0) {
    return current >= target ? 'complete' : 'active';
  }
  return 'active';
}

// Amount still to go. Never negative — an over-shot goal reports 0 remaining.
export function remaining(current: number, target: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target)) return 0;
  return Math.max(0, target - current);
}

// Circumference of the progress ring for a given radius.
export function ringCircumference(radius: number = GOAL_RING_RADIUS): number {
  return 2 * Math.PI * radius;
}

// stroke-dashoffset for a completion percentage: a full ring at 100, an empty
// ring at 0. The percentage is clamped so a stray value can't produce a
// negative or overlong dash.
export function ringDashOffset(
  pct: number,
  radius: number = GOAL_RING_RADIUS,
): number {
  const safe = Number.isNaN(pct) ? 0 : Math.max(0, Math.min(100, pct));
  return ringCircumference(radius) * (1 - safe / 100);
}

// Trim trailing ".0" so whole numbers read as "128" not "128.0", but keep one
// decimal for fractional progress ("12.5").
function tidy(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

// "128 / 500 mi" — the human progress label. Unit is optional.
export function formatProgress(
  current: number,
  target: number,
  unit?: string | null,
): string {
  const base = `${tidy(current)} / ${tidy(target)}`;
  return unit ? `${base} ${unit}` : base;
}
