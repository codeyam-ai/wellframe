// Daily-briefing entry detail: readiness label + score kicker, the serif
// verdict headline, status line, and the coach transmission with its signature.

import type { DailyBriefing } from '@prisma/client';

export function BriefingDetail({ b }: { b: DailyBriefing }) {
  return (
    <div className="wf-tl-detail wf-tl-detail-single">
      <div className="wf-tl-dbody">
        <div className="wf-tl-dkicker">
          [ {b.readinessLabel ?? 'Daily briefing'}
          {b.readinessScore != null ? ` · ${b.readinessScore}` : ''} ]
        </div>
        <h1>{b.headline ?? 'Daily briefing'}</h1>
        {b.statusLine && <div className="wf-tl-dsub">{b.statusLine}</div>}
        {b.coachMessage && <p className="wf-tl-dnote">{b.coachMessage}</p>}
        {b.coachSignature && <div className="wf-tl-dsig">// {b.coachSignature}</div>}
      </div>
    </div>
  );
}
