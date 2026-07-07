// The coach transmission: one observant note, its directive, and a local-model
// signature. Deliberately quiet — a single message, not a chat thread — per the
// "coach, not chatbot" principle.

import type { DailyBriefing } from '@prisma/client';
import { emphasize } from './format';

export function CoachTransmission({ briefing }: { briefing: DailyBriefing }) {
  return (
    <div className="wf-block wf-coach">
      <div className="wf-secnum">03 / Coach · Transmission</div>
      {briefing.coachMessage ? (
        <>
          <blockquote dangerouslySetInnerHTML={{ __html: emphasize(briefing.coachMessage) }} />
          {briefing.coachDirective && <div className="meta">{briefing.coachDirective}</div>}
          {briefing.coachSignature && <div className="sig">{briefing.coachSignature}</div>}
        </>
      ) : (
        <div className="wf-empty-label">No transmission yet</div>
      )}
    </div>
  );
}
