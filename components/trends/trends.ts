// Pure, client-safe helpers for the Trends surface. Chart geometry and range
// grouping live here — no DB, fs, or secret imports — so they can be pulled
// into the client bundle and unit-tested in isolation.

export const TREND_RANGES = ['weekly', 'monthly', 'yearly'] as const;
export type TrendRange = (typeof TREND_RANGES)[number];

// Human label for a range key (drives the switcher chips).
export function rangeLabel(range: string): string {
  switch (range) {
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    default:
      return range;
  }
}

// Narrow an arbitrary string to a known range, defaulting to "weekly" so a
// stray ?range= value can never leave the switcher in an empty state.
export function normalizeRange(value: string | undefined | null): TrendRange {
  return (TREND_RANGES as readonly string[]).includes(value ?? '')
    ? (value as TrendRange)
    : 'weekly';
}

export interface ChartPoint {
  x: number;
  y: number;
}

export interface ChartGeometry {
  points: ChartPoint[];
  linePath: string; // "M x y L x y ..." polyline
  areaPath: string; // closed path for the soft fill under the line
  min: number;
  max: number;
}

// Map an ordered list of numeric values to SVG coordinates inside a
// width×height box with `pad` inset on every edge. The y-axis is inverted
// (SVG origin is top-left) and the value range is padded by 8% so the line
// never touches the frame. A flat series (min === max) plots on the vertical
// centre. A single point sits at the horizontal centre. Empty input yields an
// empty geometry rather than NaN coordinates.
export function buildChartGeometry(
  values: number[],
  width: number,
  height: number,
  pad = 6,
): ChartGeometry {
  if (values.length === 0) {
    return { points: [], linePath: '', areaPath: '', min: 0, max: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const innerW = Math.max(0, width - pad * 2);
  const innerH = Math.max(0, height - pad * 2);
  const span = max - min;
  const flat = span === 0;
  // 8% headroom so peaks/troughs breathe.
  const padded = span * 1.16;
  const midOffset = (padded - span) / 2;

  const points: ChartPoint[] = values.map((v, i) => {
    const x =
      values.length === 1
        ? pad + innerW / 2
        : pad + (innerW * i) / (values.length - 1);
    // A flat series has no spread — plot it on the vertical centre rather than
    // dividing by zero.
    const t = flat ? 0.5 : (v - min + midOffset) / padded; // 0..1 within padded range
    const y = pad + innerH * (1 - t);
    return { x: round(x), y: round(y) };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const first = points[0];
  const last = points[points.length - 1];
  const baseY = round(height - pad);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`
      : '';

  return { points, linePath, areaPath, min, max };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
