import { describe, it, expect } from 'vitest';
import {
  subjectiveFatigue,
  fatigueIndex,
  fatigueBand,
  generateTrainingPlan,
  toCheckinRatings,
  parseMetricNumber,
} from './analysis.js';

describe('subjectiveFatigue', () => {
  // Energy and sleep are "more is better" while soreness and stress are "less
  // is better"; inverting only the first pair is what makes the scale coherent.
  it('inverts energy and sleep', () => {
    expect(subjectiveFatigue([{ soreness: 5, stress: 5, energy: 1, sleepQuality: 1 }])).toBe(100);
    expect(subjectiveFatigue([{ soreness: 1, stress: 1, energy: 5, sleepQuality: 5 }])).toBe(0);
    expect(subjectiveFatigue([])).toBe(null);
  });
});

describe('fatigueIndex', () => {
  // The composite must agree with the band function it reports, or the coach
  // would describe a number that contradicts its own label.
  it('blends recovery and subjective signals and bands correctly', () => {
    const r = fatigueIndex({
      recoveryScore: 40,
      checkins: [{ soreness: 4, stress: 4, energy: 2, sleepQuality: 2 }],
      trainingLoadLatest: 300,
    });
    expect(r.fatigue).toBeGreaterThan(50);
    expect(r.band).toBe(fatigueBand(r.fatigue));
    expect(r.signalsUsed).toEqual(['recovery score', 'check-in ratings']);
  });

  // A fresh install has no data at all; the tool must say why it cannot answer
  // instead of reporting a fabricated zero.
  it('reports when no signals exist', () => {
    const r = fatigueIndex({ recoveryScore: null, checkins: [], trainingLoadLatest: null });
    expect(r.signalsUsed).toHaveLength(0);
    expect(r.note).toMatch(/log a check-in/i);
  });
});

describe('toCheckinRatings', () => {
  // The remap must rename sleep_quality → sleepQuality, or the fatigue math
  // silently sees undefined sleep for every check-in.
  it('remaps snake_case DB rows to the ratings shape', () => {
    const out = toCheckinRatings([
      { energy: 4, soreness: 2, stress: 1, sleep_quality: 3 },
    ]);
    expect(out).toEqual([{ energy: 4, soreness: 2, stress: 1, sleepQuality: 3 }]);
  });

  // Empty input is the fresh-install case and must stay empty, not throw.
  it('returns an empty array for no rows', () => {
    expect(toCheckinRatings([])).toEqual([]);
  });

  // Null fields carry through so subjectiveFatigue can skip them rather than
  // treating a missing rating as zero.
  it('preserves null fields', () => {
    const out = toCheckinRatings([{ energy: null, sleep_quality: null }]);
    expect(out[0].energy).toBeNull();
    expect(out[0].sleepQuality).toBeNull();
  });
});

describe('parseMetricNumber', () => {
  // Trend metrics arrive as display strings; the leading number must be pulled
  // out for the fatigue math to use it.
  it('extracts the numeric value from a metric string', () => {
    expect(parseMetricNumber('62')).toBe(62);
    expect(parseMetricNumber('7.4 h')).toBe(7.4);
    expect(parseMetricNumber('1,240')).toBe(1240);
  });

  // Absent or non-numeric input is "no signal", returned as null so callers
  // don't feed NaN into the composite.
  it('returns null for null, undefined, or non-numeric input', () => {
    expect(parseMetricNumber(null)).toBeNull();
    expect(parseMetricNumber(undefined)).toBeNull();
    expect(parseMetricNumber('n/a')).toBeNull();
  });

  // A parsed zero collapses to null so "no signal" and "0" are treated alike by
  // the fatigue math, matching the original inline behavior.
  it('treats a zero value as null', () => {
    expect(parseMetricNumber('0')).toBeNull();
  });
});

describe('generateTrainingPlan', () => {
  // The safety-critical direction: when the athlete is deeply fatigued the plan
  // must skew to rest rather than prescribe more load.
  it('is rest-led under very high fatigue', () => {
    const p = generateTrainingPlan({
      fatigue: 85,
      band: 'Very High',
      readinessLabel: 'Compromised',
      goals: [],
      days: 7,
    });
    expect(p.days).toHaveLength(7);
    const rest = p.days.filter((d) => d.session === 'Rest' || d.session === 'Recovery').length;
    expect(rest).toBeGreaterThanOrEqual(4);
  });

  // The opposite direction: a fresh athlete should get hard work, otherwise the
  // plan is uselessly conservative.
  it('adds quality work when fresh', () => {
    const p = generateTrainingPlan({
      fatigue: 15,
      band: 'Fresh',
      readinessLabel: 'Primed',
      goals: [],
      days: 7,
    });
    expect(p.days.some((d) => d.session === 'Quality')).toBe(true);
  });

  // Goals must actually shape the plan and be explained in the rationale, so
  // the athlete can see why a session was chosen.
  it('folds in a strength goal', () => {
    const p = generateTrainingPlan({
      fatigue: 40,
      band: 'Moderate',
      readinessLabel: 'Steady',
      goals: [{ title: 'Strength train 3x/week', category: 'strength', percent: 50 }],
      days: 7,
    });
    expect(p.days.some((d) => d.session === 'Strength')).toBe(true);
    expect(p.rationale.some((r) => /strength/i.test(r))).toBe(true);
  });
});
