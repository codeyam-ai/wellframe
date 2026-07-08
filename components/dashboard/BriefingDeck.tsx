// The populated dashboard deck: the readiness hero above a three-panel info
// row (vitals, coach transmission, field log). Pure layout composition — the
// DashboardConsole owns the state and hands this the data + coach callback.
'use client';

import type { DailyBriefing, Vital, Workout } from '@prisma/client';
import { ReadinessHero } from './ReadinessHero';
import { VitalsPanel } from './VitalsPanel';
import { CoachTransmission } from './CoachTransmission';
import { FieldLog } from './FieldLog';

export function BriefingDeck({
  briefing,
  vitals,
  workout,
  onQueryCoach = () => {},
}: {
  briefing: DailyBriefing;
  vitals: Vital[];
  workout: Workout | null;
  onQueryCoach?: () => void;
}) {
  return (
    <div className="wf-deck">
      <ReadinessHero briefing={briefing} onQueryCoach={onQueryCoach} />
      <section className="wf-info">
        <VitalsPanel vitals={vitals} />
        <CoachTransmission briefing={briefing} />
        <FieldLog workout={workout} />
      </section>
    </div>
  );
}
