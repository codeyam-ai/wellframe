// The left instrument panel of the Recovery Center: the recovery-score dial
// (reusing the readiness-dial geometry), the score + label, a coordinates strip
// (how many signals are strong, plus the status line), and the serif verdict +
// summary. Pure presentational — geometry comes from the shared dial helpers.

import { readinessDashOffset, circumference, DIAL_RADIUS } from '../dashboard/dial';
import { factorTally } from './recovery';
import type { RecoveryFactor } from './models';

export function RecoveryHero({
  score,
  label,
  headline,
  summary,
  statusLine,
  factors,
}: {
  score: number;
  label: string | null;
  headline: string | null;
  summary: string | null;
  statusLine: string | null;
  factors: RecoveryFactor[];
}) {
  const tally = factorTally(factors);

  return (
    <section className="wf-hero">
      <div className="wf-secnum">
        <span className="n">01 /</span> Recovery
      </div>
      <div className="core">
        <div className="dialwrap">
          <svg width="100%" height="100%" viewBox="0 0 400 400">
            <circle
              cx="200"
              cy="200"
              r={DIAL_RADIUS}
              fill="none"
              stroke="rgba(237,240,243,.06)"
              strokeWidth="1"
            />
            <circle
              cx="200"
              cy="200"
              r="146"
              fill="none"
              stroke="rgba(237,240,243,.035)"
              strokeWidth="1"
            />
            <circle
              cx="200"
              cy="200"
              r={DIAL_RADIUS}
              fill="none"
              stroke="var(--wf-sig)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference()}
              strokeDashoffset={readinessDashOffset(score)}
              transform="rotate(-90 200 200)"
            />
          </svg>
          <div className="v">
            <b>{score}</b>
            <span className="s">{label ?? 'Recovery'}</span>
          </div>
        </div>
        <div className="coord">
          <span>
            SIGNALS{' '}
            <b>
              {tally.strong}/{tally.total} STRONG
            </b>
          </span>
          {statusLine && <span>{statusLine}</span>}
        </div>
        <div className="foot">
          {headline && <h1>{headline}</h1>}
          {summary && <div className="wf-rec-summary">{summary}</div>}
        </div>
      </div>
    </section>
  );
}
