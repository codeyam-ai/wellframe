import { describe, it, expect } from 'vitest';
import {
  clampRating,
  inferPartOfDay,
  ratingLabel,
  validateCheckinInput,
  wellbeingScore,
} from './checkin';

describe('inferPartOfDay', () => {
  // Before noon is morning; noon onward is evening.
  it('is morning before noon, evening after', () => {
    expect(inferPartOfDay(7)).toBe('morning');
    expect(inferPartOfDay(11)).toBe('morning');
    expect(inferPartOfDay(12)).toBe('evening');
    expect(inferPartOfDay(21)).toBe('evening');
  });
  // An out-of-range or NaN hour falls back to morning.
  it('falls back to morning for an out-of-range hour', () => {
    expect(inferPartOfDay(-1)).toBe('morning');
    expect(inferPartOfDay(99)).toBe('morning');
    expect(inferPartOfDay(NaN)).toBe('morning');
  });
});

describe('clampRating', () => {
  // Valid 1-5 ratings (numeric or string) pass through.
  it('passes valid 1-5 ratings through', () => {
    expect(clampRating(3)).toBe(3);
    expect(clampRating('4')).toBe(4);
  });
  // Values above 5 clamp to 5 and fractionals round.
  it('clamps high values to 5 and rounds', () => {
    expect(clampRating(9)).toBe(5);
    expect(clampRating(4.6)).toBe(5);
  });
  // Missing, blank, or sub-1 values read as not rated (null).
  it('treats missing / blank / sub-1 as not rated', () => {
    expect(clampRating(null)).toBeNull();
    expect(clampRating(undefined)).toBeNull();
    expect(clampRating('')).toBeNull();
    expect(clampRating(0)).toBeNull();
  });
});

describe('ratingLabel', () => {
  // Each 1-5 value maps to a word; null renders as an em dash.
  it('maps values to words', () => {
    expect(ratingLabel(1)).toBe('Very low');
    expect(ratingLabel(5)).toBe('Excellent');
    expect(ratingLabel(null)).toBe('—');
  });
});

describe('validateCheckinInput', () => {
  const iso = '2026-07-07T07:10:00Z';

  // A morning check-in with ratings is accepted, text trimmed, ratings coerced.
  it('accepts a morning check-in with ratings', () => {
    const r = validateCheckinInput({
      partOfDay: 'morning',
      occurredAt: iso,
      energy: '4',
      mood: '  Steady  ',
      sleepQuality: 5,
      soreness: 2,
      stress: 2,
      note: '  Slept well  ',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.partOfDay).toBe('morning');
      expect(r.value.energy).toBe(4);
      expect(r.value.mood).toBe('Steady');
      expect(r.value.note).toBe('Slept well');
    }
  });

  // An unrecognized part of day is rejected.
  it('rejects an invalid part of day', () => {
    expect(validateCheckinInput({ partOfDay: 'noon', occurredAt: iso, energy: 3 }).ok).toBe(
      false,
    );
  });

  // A missing or unparseable timestamp is rejected.
  it('rejects a missing / bad timestamp', () => {
    expect(validateCheckinInput({ partOfDay: 'morning', occurredAt: '', energy: 3 }).ok).toBe(
      false,
    );
    expect(
      validateCheckinInput({ partOfDay: 'morning', occurredAt: 'not-a-date', energy: 3 }).ok,
    ).toBe(false);
  });

  // A submission with no ratings and no mood word is rejected.
  it('rejects an all-blank submission', () => {
    const r = validateCheckinInput({ partOfDay: 'evening', occurredAt: iso });
    expect(r.ok).toBe(false);
  });

  // A submission carrying only a mood word is accepted.
  it('accepts a submission carrying only a mood word', () => {
    const r = validateCheckinInput({
      partOfDay: 'evening',
      occurredAt: iso,
      mood: 'Wired',
    });
    expect(r.ok).toBe(true);
  });
});

describe('wellbeingScore', () => {
  // With nothing rated the score is null.
  it('returns null when nothing is rated', () => {
    expect(wellbeingScore({})).toBeNull();
  });
  // An all-good day (high energy/sleep, low soreness/stress) scores at the top.
  it('scores an all-5 positive / all-1 negative day near the top', () => {
    // energy 5, sleep 5, soreness 1 (→5), stress 1 (→5) → avg 5 → 100
    expect(wellbeingScore({ energy: 5, sleepQuality: 5, soreness: 1, stress: 1 })).toBe(100);
  });
  // Soreness and stress are inverted so high values pull the score down.
  it('inverts soreness and stress so high values pull the score down', () => {
    // energy 5, stress 5 (→1) → avg 3 → 60
    expect(wellbeingScore({ energy: 5, stress: 5 })).toBe(60);
  });
  // Only the rated fields count toward the average.
  it('averages only the present fields', () => {
    // energy 4 only → 4/5 → 80
    expect(wellbeingScore({ energy: 4 })).toBe(80);
  });
});
