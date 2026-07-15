// Pure, client-safe helpers for the Daily Check-in surface. Rating math,
// part-of-day inference, and submission validation live here so the form and
// the server action agree and everything is unit-testable without a DB.

export const PARTS_OF_DAY = ['morning', 'evening'] as const;
export type PartOfDay = (typeof PARTS_OF_DAY)[number];

// The 1-5 self-rated fields shared by both parts of day.
export const RATING_FIELDS = [
  'energy',
  'sleepQuality',
  'soreness',
  'stress',
] as const;
export type RatingField = (typeof RATING_FIELDS)[number];

// Fields where a HIGHER number is worse (soreness, stress). Used to invert them
// when rolling up a single wellbeing read.
const INVERTED: ReadonlySet<RatingField> = new Set(['soreness', 'stress']);

// Morning before noon, evening after. Hours outside 0-23 fall back to morning.
export function inferPartOfDay(hour: number): PartOfDay {
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return 'morning';
  return hour < 12 ? 'morning' : 'evening';
}

// Clamp a raw rating to the integer range [1, 5]. Anything missing / NaN /
// out-of-range on the low side becomes null (not rated); high values clamp to 5.
export function clampRating(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(5, n);
}

// Word for a 1-5 rating; null → "—".
export function ratingLabel(value: number | null): string {
  switch (value) {
    case 1:
      return 'Very low';
    case 2:
      return 'Low';
    case 3:
      return 'Fair';
    case 4:
      return 'Good';
    case 5:
      return 'Excellent';
    default:
      return '—';
  }
}

export interface CheckinDraft {
  partOfDay: PartOfDay;
  occurredAt: string;
  energy: number | null;
  mood: string | null;
  sleepQuality: number | null;
  soreness: number | null;
  stress: number | null;
  note: string | null;
}

export type CheckinValidation =
  | { ok: true; value: CheckinDraft }
  | { ok: false; error: string };

// Validate + normalize a check-in submission. Requires a valid part of day, a
// valid ISO timestamp, and at least one signal (a rating or a mood word) so an
// all-blank submission can't be logged. Ratings are clamped to 1-5.
export function validateCheckinInput(raw: {
  partOfDay?: string;
  occurredAt?: string;
  energy?: number | string | null;
  mood?: string | null;
  sleepQuality?: number | string | null;
  soreness?: number | string | null;
  stress?: number | string | null;
  note?: string | null;
}): CheckinValidation {
  const partOfDay = (PARTS_OF_DAY as readonly string[]).includes(
    raw.partOfDay ?? '',
  )
    ? (raw.partOfDay as PartOfDay)
    : null;
  if (!partOfDay) {
    return { ok: false, error: 'Choose morning or evening.' };
  }

  const occurredAt = (raw.occurredAt ?? '').trim();
  if (!occurredAt || Number.isNaN(Date.parse(occurredAt))) {
    return { ok: false, error: 'A valid timestamp is required.' };
  }

  const energy = clampRating(raw.energy);
  const sleepQuality = clampRating(raw.sleepQuality);
  const soreness = clampRating(raw.soreness);
  const stress = clampRating(raw.stress);
  const mood = (raw.mood ?? '').trim() || null;
  const note = (raw.note ?? '').trim() || null;

  const hasSignal =
    energy !== null ||
    sleepQuality !== null ||
    soreness !== null ||
    stress !== null ||
    mood !== null;
  if (!hasSignal) {
    return { ok: false, error: 'Log at least one rating or a mood word.' };
  }

  return {
    ok: true,
    value: { partOfDay, occurredAt, energy, mood, sleepQuality, soreness, stress, note },
  };
}

// Roll the present ratings into a single 0-100 wellbeing read. Positive fields
// (energy, sleep) count as-is; inverted fields (soreness, stress) are flipped
// so low soreness reads as high wellbeing. Returns null when nothing is rated.
export function wellbeingScore(ratings: {
  energy?: number | null;
  sleepQuality?: number | null;
  soreness?: number | null;
  stress?: number | null;
}): number | null {
  const parts: number[] = [];
  for (const field of RATING_FIELDS) {
    const raw = ratings[field];
    if (raw === null || raw === undefined) continue;
    const clamped = Math.max(1, Math.min(5, raw));
    const effective = INVERTED.has(field) ? 6 - clamped : clamped;
    parts.push(effective);
  }
  if (parts.length === 0) return null;
  const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
  return Math.round((avg / 5) * 100);
}
