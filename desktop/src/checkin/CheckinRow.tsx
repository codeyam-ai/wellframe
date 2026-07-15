// One entry in the recent-check-ins history: the date + part of day on the
// left, and the mood word, a rolled-up wellbeing score, and the note on the
// right. Pure presentational — the wellbeing score comes from the pure helper.

import { wellbeingScore } from './checkin';
import type { Mood } from './models';

export function CheckinRow({ checkin }: { checkin: Mood }) {
  const score = wellbeingScore(checkin);
  const when = new Date(checkin.occurredAt);
  const stamp = Number.isNaN(when.getTime())
    ? ''
    : when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <article className="wf-ci-row">
      <div className="wf-ci-when">
        <span className="wf-ci-date">{stamp}</span>
        <span className="wf-ci-part-tag">{checkin.partOfDay}</span>
      </div>
      <div className="wf-ci-rowmain">
        <div className="wf-ci-rowhead">
          {checkin.mood && <span className="wf-ci-moodword">{checkin.mood}</span>}
          {score !== null && <span className="wf-ci-score">{score} wellbeing</span>}
        </div>
        {checkin.note && <p className="wf-ci-note">{checkin.note}</p>}
      </div>
    </article>
  );
}
