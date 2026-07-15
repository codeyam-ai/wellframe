// Readiness-dial geometry. The dial is a stroked SVG circle whose
// stroke-dashoffset encodes the 0-100 score: a full ring at 100, an empty
// ring at 0. Pure math — no rendering, so it is unit-testable in isolation.

export const DIAL_RADIUS = 176;

// Arc length of the dial ring for a given radius (defaults to the design's
// 176px ring). Used for both stroke-dasharray and the offset computation.
export function circumference(radius: number = DIAL_RADIUS): number {
  return 2 * Math.PI * radius;
}

// stroke-dashoffset for a score. The score is clamped to [0, 100] (NaN -> 0)
// so an out-of-range reading can never produce a negative or overlong dash.
export function readinessDashOffset(
  score: number,
  radius: number = DIAL_RADIUS,
): number {
  const safe = Number.isNaN(score) ? 0 : score;
  const clamped = Math.max(0, Math.min(100, safe));
  return circumference(radius) * (1 - clamped / 100);
}
