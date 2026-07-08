'use client';

// Left instrument hero: composes the readiness dial, the coordinates strip, and
// the serif verdict. Each is its own component; this file only assembles them
// and prepares the coordinate rows from the briefing.

import type { DailyBriefing } from '@prisma/client';
import { ReadinessDial } from './ReadinessDial';
import { CoordStrip } from './CoordStrip';
import { ReadinessVerdict } from './ReadinessVerdict';

export function ReadinessHero({
  briefing,
  onQueryCoach = () => {},
}: {
  briefing: DailyBriefing;
  onQueryCoach?: () => void;
}) {
  const coords: Array<[string, string | null]> = [
    ['ELEV', briefing.elevation],
    ['WIND', briefing.wind],
    ['WINDOW', briefing.windowLabel],
  ];

  return (
    <section className="wf-hero">
      <div className="wf-secnum">01 / Readiness</div>
      <div className="core">
        <ReadinessDial score={briefing.readinessScore} label={briefing.readinessLabel} />
        <CoordStrip coords={coords} />
        <ReadinessVerdict briefing={briefing} onQueryCoach={onQueryCoach} />
      </div>
    </section>
  );
}
