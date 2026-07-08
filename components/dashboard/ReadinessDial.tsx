// The readiness instrument dial: a fixed tick-marked bezel with a score arc
// whose length is derived from the score, plus the centered numeric readout.
// The arc geometry comes from ./dial so it stays honest across scenarios.

import { circumference, readinessDashOffset } from './dial';

const CIRCUMFERENCE = circumference(); // ~1105.84

export function ReadinessDial({
  score,
  label,
}: {
  score: number | null;
  label?: string | null;
}) {
  const dashOffset = readinessDashOffset(score ?? 0);

  return (
    <div className="dialwrap">
      <svg width="100%" height="100%" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="176" fill="none" stroke="rgba(237,240,243,.05)" strokeWidth="1" />
        <circle cx="200" cy="200" r="146" fill="none" stroke="rgba(237,240,243,.035)" strokeWidth="1" />
        <g stroke="rgba(237,240,243,.26)" strokeWidth="1.5">
          <line x1="200" y1="14" x2="200" y2="34" />
          <line x1="200" y1="366" x2="200" y2="386" />
          <line x1="14" y1="200" x2="34" y2="200" />
          <line x1="366" y1="200" x2="386" y2="200" />
        </g>
        <g stroke="rgba(237,240,243,.13)" strokeWidth="1">
          <line x1="301" y1="50" x2="294" y2="62" />
          <line x1="351" y1="136" x2="339" y2="142" />
          <line x1="351" y1="264" x2="339" y2="258" />
          <line x1="301" y1="350" x2="294" y2="338" />
          <line x1="99" y1="350" x2="106" y2="338" />
          <line x1="49" y1="264" x2="61" y2="258" />
          <line x1="49" y1="136" x2="61" y2="142" />
          <line x1="99" y1="50" x2="106" y2="62" />
        </g>
        <circle
          cx="200"
          cy="200"
          r="176"
          fill="none"
          stroke="var(--wf-sig)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 200 200)"
        />
      </svg>
      <div className="v">
        <b>{score ?? '--'}</b>
        {label && <span className="s">{label}</span>}
      </div>
    </div>
  );
}
