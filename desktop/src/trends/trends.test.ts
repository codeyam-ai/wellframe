import { describe, it, expect } from 'vitest';
import {
  buildChartGeometry,
  normalizeRange,
  rangeLabel,
  TREND_RANGES,
} from './trends';

describe('rangeLabel', () => {
  // Known range keys map to their title-case labels.
  it('maps known range keys to titles', () => {
    expect(rangeLabel('weekly')).toBe('Weekly');
    expect(rangeLabel('monthly')).toBe('Monthly');
    expect(rangeLabel('yearly')).toBe('Yearly');
  });
  // An unrecognized range key is returned unchanged.
  it('passes through an unknown key unchanged', () => {
    expect(rangeLabel('daily')).toBe('daily');
  });
});

describe('normalizeRange', () => {
  // Each known range narrows to itself.
  it('accepts each known range', () => {
    for (const r of TREND_RANGES) expect(normalizeRange(r)).toBe(r);
  });
  // Unknown / null / undefined all default to the weekly range.
  it('defaults unknown / null / undefined to weekly', () => {
    expect(normalizeRange('quarterly')).toBe('weekly');
    expect(normalizeRange(null)).toBe('weekly');
    expect(normalizeRange(undefined)).toBe('weekly');
  });
});

describe('buildChartGeometry', () => {
  // No values yields an empty geometry with no NaN coordinates.
  it('returns an empty geometry for no values, no NaN coords', () => {
    const g = buildChartGeometry([], 300, 100);
    expect(g.points).toEqual([]);
    expect(g.linePath).toBe('');
    expect(g.areaPath).toBe('');
  });

  // A single value plots at the horizontal centre of the box.
  it('places a single point at the horizontal centre', () => {
    const g = buildChartGeometry([42], 300, 100, 6);
    expect(g.points).toHaveLength(1);
    // pad + innerW/2 = 6 + (300-12)/2 = 150
    expect(g.points[0].x).toBe(150);
    expect(g.min).toBe(42);
    expect(g.max).toBe(42);
  });

  // Multiple points spread evenly across the inner (padded) width.
  it('spreads points evenly across the inner width', () => {
    const g = buildChartGeometry([1, 2, 3], 212, 100, 6);
    // innerW = 200, three points → x = 6, 106, 206
    expect(g.points.map((p) => p.x)).toEqual([6, 106, 206]);
  });

  // Every y coordinate stays inside the padded box (peaks never clip).
  it('keeps all y coordinates inside the padded box', () => {
    const g = buildChartGeometry([10, 90, 30, 70], 300, 120, 6);
    for (const p of g.points) {
      expect(p.y).toBeGreaterThanOrEqual(6);
      expect(p.y).toBeLessThanOrEqual(114);
    }
  });

  // A flat series plots on the vertical centre without dividing by zero.
  it('plots a flat series on the vertical centre without dividing by zero', () => {
    const g = buildChartGeometry([5, 5, 5], 300, 100, 6);
    const centre = 6 + (100 - 12) / 2; // 50
    for (const p of g.points) expect(p.y).toBeCloseTo(centre, 5);
  });

  // Larger values render higher on the canvas (a smaller y, since y is inverted).
  it('draws higher values higher on the canvas, smaller y', () => {
    const g = buildChartGeometry([1, 9], 200, 100, 6);
    expect(g.points[1].y).toBeLessThan(g.points[0].y);
  });

  // The area path is the line path closed back down to the baseline.
  it('closes the area path back to the baseline', () => {
    const g = buildChartGeometry([2, 8, 4], 300, 100, 6);
    expect(g.linePath.startsWith('M')).toBe(true);
    expect(g.areaPath.endsWith('Z')).toBe(true);
    expect(g.areaPath).toContain(g.linePath);
  });
});
