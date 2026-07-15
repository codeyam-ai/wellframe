// Check-in entry detail: the morning/evening mood word plus its 1-5 self-
// ratings (energy, sleep, soreness, stress) and the optional reflection note.

import type { Mood } from './models';
import { Rating } from './Rating';

export function MoodDetail({ m }: { m: Mood }) {
  const part = m.partOfDay === 'evening' ? 'Evening' : 'Morning';
  return (
    <div className="wf-tl-detail wf-tl-detail-single">
      <div className="wf-tl-dbody">
        <div className="wf-tl-dkicker">[ {part} check-in ]</div>
        <h1>{m.mood ?? `${part} check-in`}</h1>
        <div className="wf-tl-ratings">
          <Rating label="Energy" value={m.energy} />
          <Rating label="Sleep" value={m.sleepQuality} />
          <Rating label="Soreness" value={m.soreness} />
          <Rating label="Stress" value={m.stress} />
        </div>
        {m.note && <p className="wf-tl-dnote">{m.note}</p>}
      </div>
    </div>
  );
}
