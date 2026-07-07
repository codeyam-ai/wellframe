'use client';

// Left instrument hero: the readiness dial, coordinates strip, and the serif
// verdict with its action buttons. The dial arc length is derived from the
// score so it stays honest across scenarios (primed 82 vs compromised 38).

import type { DailyBriefing } from '@prisma/client';
import { circumference, readinessDashOffset } from './dial';
import { emphasize } from './format';

const CIRCUMFERENCE = circumference(); // ~1105.84

export function ReadinessHero({
  briefing,
  onQueryCoach = () => {},
}: {
  briefing: DailyBriefing;
  onQueryCoach?: () => void;
}) {
  const dashOffset = readinessDashOffset(briefing.readinessScore ?? 0);

  const coords: Array<[string, string | null]> = [
    ['ELEV', briefing.elevation],
    ['WIND', briefing.wind],
    ['WINDOW', briefing.windowLabel],
  ];
  const shownCoords = coords.filter(([, v]) => v);

  return (
    <section className="wf-hero">
      <div className="wf-secnum">01 / Readiness</div>
      <div className="core">
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
            <b>{briefing.readinessScore ?? '--'}</b>
            {briefing.readinessLabel && <span className="s">{briefing.readinessLabel}</span>}
          </div>
        </div>

        {shownCoords.length > 0 && (
          <div className="coord">
            {shownCoords.map(([k, v]) => (
              <span key={k}>
                {k} <b>{v}</b>
              </span>
            ))}
          </div>
        )}

        <div className="foot">
          {briefing.headline && (
            <h1 dangerouslySetInnerHTML={{ __html: emphasize(briefing.headline) }} />
          )}
          {briefing.statusLine && <div className="status">{briefing.statusLine}</div>}
          <div className="cta">
            {briefing.suggestedWorkout && (
              <button className="wf-btn p" type="button">
                {briefing.suggestedWorkout}
              </button>
            )}
            <button className="wf-btn" type="button" onClick={onQueryCoach}>
              Query coach ⌘K
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
