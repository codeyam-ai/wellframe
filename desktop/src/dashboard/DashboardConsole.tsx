// The Wellframe dashboard "Daily Briefing Console" — desktop port. Composes the
// metabar, readiness hero, vitals, coach transmission, and field log — or the
// day-one onboarding state when there's no briefing yet.
//
// This first port covers the read-only briefing. The CoachDock overlay (⌘K) and
// the ConnectionsPanel (provider connect/disconnect, which are mutations) are
// deferred to a follow-up cycle where they become Tauri command invocations;
// their trigger buttons render but are inert for now.

import type { DashboardData } from './models';
import { Metabar } from './Metabar';
import { WF_NAV_LINKS } from './nav';
import { BriefingDeck } from './BriefingDeck';
import { EmptyBriefing } from './EmptyBriefing';

const noop = () => {};

export function DashboardConsole({ briefing, vitals, workout }: DashboardData) {
  const dateLabel = briefing?.dateLabel ?? 'Awaiting first sync';

  return (
    <div className="wf">
      <Metabar dateLabel={dateLabel} navLinks={WF_NAV_LINKS} />
      {briefing ? (
        <BriefingDeck
          briefing={briefing}
          vitals={vitals}
          workout={workout}
          onQueryCoach={noop}
        />
      ) : (
        <EmptyBriefing onQueryCoach={noop} onOpenSetup={noop} />
      )}
    </div>
  );
}

export default DashboardConsole;
