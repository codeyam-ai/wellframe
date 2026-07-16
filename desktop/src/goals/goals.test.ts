import { describe, it, expect } from 'vitest';
import {
  formatProgress,
  goalStatus,
  progressPct,
  remaining,
  ringCircumference,
  ringDashOffset,
  validateGoalInput,
  GOAL_RING_RADIUS,
} from './goals';

describe('progressPct', () => {
  // A normal current/target yields the expected percentage.
  it('computes a normal fraction', () => {
    expect(progressPct(128, 500)).toBeCloseTo(25.6, 5);
  });
  // Progress beyond the target clamps to 100%.
  it('clamps over-shot progress to 100', () => {
    expect(progressPct(600, 500)).toBe(100);
  });
  // A non-positive target degrades to 0 rather than dividing by zero.
  it('returns 0 for a non-positive target instead of dividing by zero', () => {
    expect(progressPct(10, 0)).toBe(0);
    expect(progressPct(10, -5)).toBe(0);
  });
  // NaN or infinite inputs degrade to 0.
  it('returns 0 for NaN / infinite inputs', () => {
    expect(progressPct(NaN, 100)).toBe(0);
    expect(progressPct(10, Infinity)).toBe(0);
  });
  // Zero current is 0% at the start.
  it('is 0 at the start', () => {
    expect(progressPct(0, 500)).toBe(0);
  });
});

describe('goalStatus', () => {
  // Below the target the goal is active.
  it('is active before the target', () => {
    expect(goalStatus(128, 500)).toBe('active');
  });
  // At or beyond the target the goal is complete.
  it('is complete at or beyond the target', () => {
    expect(goalStatus(500, 500)).toBe('complete');
    expect(goalStatus(520, 500)).toBe('complete');
  });
  // A bad (non-positive) target reads as active.
  it('is active for a bad target', () => {
    expect(goalStatus(10, 0)).toBe('active');
  });
});

describe('remaining', () => {
  // Reports how much is left to reach the target.
  it('reports the gap to target', () => {
    expect(remaining(128, 500)).toBe(372);
  });
  // An over-shot goal reports 0 remaining, never negative.
  it('never goes negative on an over-shot goal', () => {
    expect(remaining(520, 500)).toBe(0);
  });
});

describe('ring geometry', () => {
  // Ring circumference is 2πr.
  it('circumference matches 2πr', () => {
    expect(ringCircumference(26)).toBeCloseTo(2 * Math.PI * 26, 5);
  });
  // Dash offset is the full circumference at 0% and zero at 100%.
  it('offset is full circumference at 0% and 0 at 100%', () => {
    const c = ringCircumference(GOAL_RING_RADIUS);
    expect(ringDashOffset(0)).toBeCloseTo(c, 5);
    expect(ringDashOffset(100)).toBeCloseTo(0, 5);
  });
  // Out-of-range percentages clamp to the [0, 100] dash range.
  it('clamps out-of-range percentages', () => {
    expect(ringDashOffset(150)).toBeCloseTo(0, 5);
    expect(ringDashOffset(-20)).toBeCloseTo(ringCircumference(), 5);
  });
});

describe('formatProgress', () => {
  // Whole numbers render without a decimal point.
  it('renders whole numbers without decimals', () => {
    expect(formatProgress(128, 500, 'mi')).toBe('128 / 500 mi');
  });
  // Fractional values keep one decimal place.
  it('keeps one decimal for fractional values', () => {
    expect(formatProgress(12.5, 30, 'sessions')).toBe('12.5 / 30 sessions');
  });
  // The unit is omitted when not supplied.
  it('omits the unit when not given', () => {
    expect(formatProgress(3, 8)).toBe('3 / 8');
  });
});

describe('validateGoalInput', () => {
  // A well-formed draft is accepted with text trimmed and numbers coerced.
  it('accepts a well-formed draft and trims text', () => {
    const r = validateGoalInput({
      title: '  Run 500 miles  ',
      category: 'distance',
      metric: ' Miles ',
      target: '500',
      current: '128',
      unit: 'mi',
      cadence: 'This year',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.title).toBe('Run 500 miles');
      expect(r.value.metric).toBe('Miles');
      expect(r.value.target).toBe(500);
      expect(r.value.current).toBe(128);
      expect(r.value.category).toBe('distance');
    }
  });
  // An empty (whitespace-only) title is rejected.
  it('rejects an empty title', () => {
    const r = validateGoalInput({ title: '   ', target: 10 });
    expect(r.ok).toBe(false);
  });
  // A zero, negative, or non-numeric target is rejected.
  it('rejects a non-positive or non-numeric target', () => {
    expect(validateGoalInput({ title: 'x', target: 0 }).ok).toBe(false);
    expect(validateGoalInput({ title: 'x', target: -3 }).ok).toBe(false);
    expect(validateGoalInput({ title: 'x', target: 'abc' }).ok).toBe(false);
  });
  // An unknown category defaults to 'habit' and a blank metric to 'Progress'.
  it('defaults an unknown category to habit and metric to Progress', () => {
    const r = validateGoalInput({ title: 'x', category: 'nonsense', target: 5 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.category).toBe('habit');
      expect(r.value.metric).toBe('Progress');
    }
  });
  // A negative current value is floored to 0.
  it('floors a negative current to 0', () => {
    const r = validateGoalInput({ title: 'x', target: 5, current: -2 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.current).toBe(0);
  });
});
