import { describe, it, expect } from 'vitest';
import { readinessDashOffset, circumference, DIAL_RADIUS } from './dial';

describe('circumference', () => {
  // computes 2 pi r for the default dial radius
  it('computes the default-radius circumference', () => {
    expect(circumference()).toBeCloseTo(2 * Math.PI * DIAL_RADIUS, 5);
  });

  // honors a custom radius argument
  it('computes a custom-radius circumference', () => {
    expect(circumference(10)).toBeCloseTo(2 * Math.PI * 10, 5);
  });
});

describe('readinessDashOffset', () => {
  // a full score leaves no gap, so the offset is zero
  it('returns zero offset at a full score', () => {
    expect(readinessDashOffset(100)).toBeCloseTo(0, 5);
  });

  // a zero score leaves the whole ring undrawn
  it('returns the full circumference at a zero score', () => {
    expect(readinessDashOffset(0)).toBeCloseTo(circumference(), 5);
  });

  // the mockup score of eighty-two matches the reference offset
  it('matches the reference offset near eighty-two', () => {
    expect(readinessDashOffset(82)).toBeCloseTo(199.05, 1);
  });

  // scores above one hundred clamp to a zero offset
  it('clamps an over-max score to zero offset', () => {
    expect(readinessDashOffset(130)).toBeCloseTo(0, 5);
  });

  // negative scores clamp to the full circumference
  it('clamps a negative score to full circumference', () => {
    expect(readinessDashOffset(-20)).toBeCloseTo(circumference(), 5);
  });

  // NaN degrades to the empty-ring offset
  it('returns full circumference for NaN', () => {
    expect(readinessDashOffset(Number.NaN)).toBeCloseTo(circumference(), 5);
  });
});
