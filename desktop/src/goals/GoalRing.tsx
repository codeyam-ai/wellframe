// A progress ring for a goal: a hairline track with a stroked arc encoding
// completion, the whole-number percentage centred inside. Geometry comes from
// the pure `goals.ts` helpers. Complete goals render the arc in mint.

import { GOAL_RING_RADIUS, ringCircumference, ringDashOffset } from './goals';

export function GoalRing({
  pct,
  complete = false,
}: {
  pct: number;
  complete?: boolean;
}) {
  const r = GOAL_RING_RADIUS;
  const c = ringCircumference(r);
  const offset = ringDashOffset(pct, r);
  const size = (r + 6) * 2;
  const centre = size / 2;

  return (
    <div className="wf-goal-ring">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle
          cx={centre}
          cy={centre}
          r={r}
          fill="none"
          stroke="rgba(237,240,243,0.1)"
          strokeWidth="3"
        />
        <circle
          cx={centre}
          cy={centre}
          r={r}
          fill="none"
          stroke={complete ? 'var(--wf-mint)' : 'var(--wf-sig)'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${centre} ${centre})`}
        />
      </svg>
      <span className="wf-goal-pct">{Math.round(pct)}</span>
    </div>
  );
}
