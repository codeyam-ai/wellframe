// The Wellframe dashboard "Daily Briefing Console". Composes the metabar,
// readiness hero, vitals, coach transmission, and field log — or the day-one
// onboarding state when there's no briefing yet. Client component because it
// owns the coach-dock open state and the ⌘K shortcut.
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DailyBriefing, Vital, Workout } from '@prisma/client';
import type { ProviderView } from './connections';
import { connectProvider, disconnectProvider, setActiveCoach } from '@/app/lib/connections.actions';
import { Metabar } from './Metabar';
import { BriefingDeck } from './BriefingDeck';
import { EmptyBriefing } from './EmptyBriefing';
import { CoachDock } from './CoachDock';
import { ConnectionsPanel } from './ConnectionsPanel';

export interface DashboardConsoleProps {
  briefing: DailyBriefing | null;
  vitals: Vital[];
  workout: Workout | null;
  // Merged catalog + connection state for the Connections panel.
  aiViews: ProviderView[];
  healthViews: ProviderView[];
  // Open the coach dock on first render (e.g. ?coach=1 deep link, or a
  // scenario that captures the coach-open state).
  initialCoachOpen?: boolean;
  // Open the Connections/Setup panel on first render (?setup=1 deep link, or a
  // scenario that captures the setup-open state).
  initialSetupOpen?: boolean;
}

export function DashboardConsole({
  briefing,
  vitals,
  workout,
  aiViews,
  healthViews,
  initialCoachOpen = false,
  initialSetupOpen = false,
}: DashboardConsoleProps) {
  const [coachOpen, setCoachOpen] = useState(initialCoachOpen);
  const openCoach = useCallback(() => setCoachOpen(true), []);
  const closeCoach = useCallback(() => setCoachOpen(false), []);

  const [setupOpen, setSetupOpen] = useState(initialSetupOpen);
  const openSetup = useCallback(() => setSetupOpen(true), []);
  const closeSetup = useCallback(() => setSetupOpen(false), []);

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
      <Metabar dateLabel={dateLabel} onOpenSetup={openSetup} />
      {briefing ? (
        <BriefingDeck
          briefing={briefing}
          vitals={vitals}
          workout={workout}
          onQueryCoach={openCoach}
        />
      ) : (
        <EmptyBriefing onQueryCoach={openCoach} onOpenSetup={openSetup} />
      )}
      <CoachDock open={coachOpen} onClose={closeCoach} />
      <ConnectionsPanel
        open={setupOpen}
        onClose={closeSetup}
        aiViews={aiViews}
        healthViews={healthViews}
        onConnect={connectProvider}
        onDisconnect={disconnectProvider}
        onSetActive={setActiveCoach}
      />
    </div>
  );
}

export default DashboardConsole;
