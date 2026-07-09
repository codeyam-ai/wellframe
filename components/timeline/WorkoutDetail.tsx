// Workout entry detail: grayscale photo plate plus the full distance / pace /
// vertical / duration stat set. Falls back to a one-line summary when a workout
// carries no discrete stats.

import type { Workout } from '@prisma/client';
import { DetailStat } from './DetailStat';
import { workoutSummary } from './timeline';

export function WorkoutDetail({ w }: { w: Workout }) {
  return (
    <div className="wf-tl-detail">
      {w.photoUrl && (
        <figure className="wf-tl-dplate">
          <div className="img" style={{ backgroundImage: `url('${w.photoUrl}')` }} />
          {w.typeLabel && <figcaption className="cap">{w.typeLabel}</figcaption>}
        </figure>
      )}
      <div className="wf-tl-dbody">
        <div className="wf-tl-dkicker">[ {w.kind ?? 'workout'} ]</div>
        <h1>{w.title}</h1>
        {!w.photoUrl && w.typeLabel && <div className="wf-tl-dsub">{w.typeLabel}</div>}
        <div className="wf-tl-dstats">
          {w.distance && <DetailStat k="Distance" val={w.distance} />}
          {w.pace && <DetailStat k="Pace" val={w.pace} />}
          {w.vertical && <DetailStat k="Vertical" val={w.vertical} />}
          {w.duration && <DetailStat k="Duration" val={w.duration} />}
        </div>
        {!w.distance && !w.pace && !w.vertical && (
          <div className="wf-tl-dsummary">{workoutSummary(w) || 'No stats recorded.'}</div>
        )}
      </div>
    </div>
  );
}
