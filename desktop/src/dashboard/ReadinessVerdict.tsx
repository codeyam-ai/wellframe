// The serif verdict block under the dial: headline, status line, the two
// action buttons (suggested workout + Query coach), and the plain-language
// "what does this mean?" disclosure for the suggested session.

import type { DailyBriefing } from './models';
import { emphasize } from './format';
import { InfoDisclosure } from './InfoDisclosure';

export function ReadinessVerdict({
  briefing,
  onQueryCoach = () => {},
}: {
  briefing: DailyBriefing;
  onQueryCoach?: () => void;
}) {
  return (
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
      {briefing.suggestedWorkout && (
        <InfoDisclosure label="What does this mean?">
          <p>
            <strong>Zone 2</strong> is an easy, conversational pace, steady
            enough that you could talk the whole way. It builds your aerobic
            base without piling on fatigue.
          </p>
          <p>
            Today's 45-minute session banks training while keeping you fresh
            for Thursday's Ridge Trail Half.
          </p>
        </InfoDisclosure>
      )}
    </div>
  );
}
