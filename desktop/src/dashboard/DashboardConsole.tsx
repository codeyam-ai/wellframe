// The Wellframe dashboard "Daily Briefing Console" — desktop port. Composes the
// metabar, readiness hero, vitals, coach transmission, and field log — or the
// day-one onboarding state when there's no briefing yet.
//
// The Connections panel (AI-coach + health-source connect/disconnect) is wired
// here: it loads persisted connections from the Rust `list_connections` command,
// merges them with the provider catalog, and drives connect/disconnect/set-active
// through the connection commands. The "Set Up" metabar button and the day-one
// onboarding's Connect buttons open it.

import { useCallback, useEffect, useState } from 'react';
import type { DashboardData } from './models';
import { Metabar } from './Metabar';
import { WF_NAV_LINKS } from './nav';
import { BriefingDeck } from './BriefingDeck';
import { EmptyBriefing } from './EmptyBriefing';
import { ConnectionsPanel } from '../connections/ConnectionsPanel';
import {
  loadConnections,
  connectProvider,
  disconnectProvider,
  setActiveCoach,
} from '../connections/data';
import {
  AI_PROVIDERS,
  HEALTH_SOURCES,
  mergeCatalog,
  activeCoach,
  type ConnectionRow,
  type ConnectMethod,
} from '../connections/connections';

export function DashboardConsole({ briefing, vitals, workout }: DashboardData) {
  const [setupOpen, setSetupOpen] = useState(false);
  const [rows, setRows] = useState<ConnectionRow[]>([]);

  const reload = useCallback(() => {
    loadConnections().then(setRows);
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);

  const aiViews = mergeCatalog(AI_PROVIDERS, rows);
  const healthViews = mergeCatalog(HEALTH_SOURCES, rows);
  const coachConnected = activeCoach(aiViews) != null || aiViews.some((v) => v.connected);
  const healthConnected = healthViews.some((v) => v.connected);
  const dateLabel = briefing?.dateLabel ?? 'Awaiting first sync';
  const openSetup = () => setSetupOpen(true);

  const handleConnect = async (id: string, method: ConnectMethod, value: string) => {
    const res = await connectProvider(id, method, value);
    if (res.ok) reload();
    return res;
  };
  const handleDisconnect = async (id: string) => {
    await disconnectProvider(id);
    reload();
  };
  const handleSetActive = async (id: string) => {
    await setActiveCoach(id);
    reload();
  };

  return (
    <div className="wf">
      <Metabar dateLabel={dateLabel} navLinks={WF_NAV_LINKS} onOpenSetup={openSetup} />
      {briefing ? (
        <BriefingDeck
          briefing={briefing}
          vitals={vitals}
          workout={workout}
          onQueryCoach={openSetup}
        />
      ) : (
        <EmptyBriefing
          onQueryCoach={openSetup}
          onOpenSetup={openSetup}
          coachConnected={coachConnected}
          healthConnected={healthConnected}
        />
      )}
      <ConnectionsPanel
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        aiViews={aiViews}
        healthViews={healthViews}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onSetActive={handleSetActive}
      />
    </div>
  );
}

export default DashboardConsole;
