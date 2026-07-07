// The Wellframe dashboard "Daily Briefing Console". Composes the metabar,
// readiness hero, vitals, coach transmission, and field log — or the day-one
// onboarding state when there's no briefing yet. Client component because it
// owns the coach-dock open state and the ⌘K shortcut.
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DailyBriefing, Vital, Workout } from '@prisma/client';
import { Metabar } from './Metabar';
import { ReadinessHero } from './ReadinessHero';
import { VitalsPanel } from './VitalsPanel';
import { CoachTransmission } from './CoachTransmission';
import { FieldLog } from './FieldLog';
import { EmptyBriefing } from './EmptyBriefing';
import { CoachDock } from './CoachDock';

export interface DashboardConsoleProps {
  briefing: DailyBriefing | null;
  vitals: Vital[];
  workout: Workout | null;
  // Open the coach dock on first render (e.g. ?coach=1 deep link, or a
  // scenario that captures the coach-open state).
  initialCoachOpen?: boolean;
}

export function DashboardConsole({
  briefing,
  vitals,
  workout,
  initialCoachOpen = false,
}: DashboardConsoleProps) {
  const [coachOpen, setCoachOpen] = useState(initialCoachOpen);
  const openCoach = useCallback(() => setCoachOpen(true), []);
  const closeCoach = useCallback(() => setCoachOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCoachOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setCoachOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dateLabel = briefing?.dateLabel ?? 'Awaiting first sync';

  return (
    <div className="wf">
      <Metabar dateLabel={dateLabel} />
      {briefing ? (
        <div className="wf-deck">
          <ReadinessHero briefing={briefing} onQueryCoach={openCoach} />
          <section className="wf-info">
            <VitalsPanel vitals={vitals} />
            <CoachTransmission briefing={briefing} />
            <FieldLog workout={workout} />
          </section>
        </div>
      ) : (
        <EmptyBriefing onQueryCoach={openCoach} />
      )}
      <CoachDock open={coachOpen} onClose={closeCoach} />
    </div>
  );
}

export default DashboardConsole;
