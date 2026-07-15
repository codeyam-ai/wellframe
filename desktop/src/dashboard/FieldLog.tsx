// Yesterday's logged activity. Photo plate (forced grayscale, Plinth
// discipline) beside title + distance/pace/vertical stats. When nothing was
// logged, the section shows its own quiet empty label rather than vanishing.

import type { Workout } from './models';
import { Stat } from './Stat';

export function FieldLog({ workout }: { workout: Workout | null }) {
  return (
    <div className="wf-block">
      <div className="wf-secnum">04 / Field Log · Yesterday</div>
      {workout ? (
        <div className="field">
          <figure className="plate">
            <div
              className="img"
              style={workout.photoUrl ? { backgroundImage: `url('${workout.photoUrl}')` } : undefined}
            />
            {workout.typeLabel && <figcaption className="cap">{workout.typeLabel}</figcaption>}
          </figure>
          <div>
            <h3>{workout.title}</h3>
            <div className="stats">
              {workout.distance && <Stat k="Distance" val={workout.distance} />}
              {workout.pace && <Stat k="Pace" val={workout.pace} />}
              {workout.vertical && <Stat k="Vertical" val={workout.vertical} />}
            </div>
          </div>
        </div>
      ) : (
        <div className="wf-empty-label">No activity logged yesterday</div>
      )}
    </div>
  );
}
