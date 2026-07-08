// The "Set Up" surface, reachable from the metabar and the day-one onboarding.
// Two plain-language groups — AI coach and health data — each a ConnectionsGroup
// backed by real, persisted connection state. Owns the "which row is expanded"
// UI state; the connect/disconnect/set-active mutations arrive as Server Action
// props from the DashboardConsole.
'use client';

import { useState } from 'react';
import type { ProviderView, ConnectMethod } from './connections';
import type { ConnectResult } from '@/app/lib/connections.actions';
import { ConnectionsGroup } from './ConnectionsGroup';

export function ConnectionsPanel({
  open,
  onClose = () => {},
  aiViews,
  healthViews,
  onConnect = async () => ({ ok: true }),
  onDisconnect = () => {},
  onSetActive = () => {},
}: {
  open: boolean;
  onClose?: () => void;
  aiViews: ProviderView[];
  healthViews: ProviderView[];
  onConnect?: (id: string, method: ConnectMethod, value: string) => Promise<ConnectResult>;
  onDisconnect?: (id: string) => void;
  onSetActive?: (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  if (!open) return null;

  const toggle = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  return (
    <div
      className="wf-dock-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Connections and setup"
      onClick={onClose}
    >
      <aside className="wf-dock wf-dock-wide" onClick={(e) => e.stopPropagation()}>
        <div className="wf-dock-head">
          <span className="wf-secnum">Connections · Setup</span>
          <button className="wf-dock-x" type="button" aria-label="Close setup" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="wf-conn-scroll">
          <ConnectionsGroup
            title="Your AI coach"
            lead="Your coach is powered by an AI model. Pick the one you trust and choose how to connect — sign in, paste a key, or run it locally. You can switch anytime."
            views={aiViews}
            expandedId={expandedId}
            onToggle={toggle}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onSetActive={onSetActive}
          />
          <ConnectionsGroup
            title="Health data"
            lead="Wellframe reads your health data to build each briefing. It stays on this machine."
            views={healthViews}
            expandedId={expandedId}
            onToggle={toggle}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onSetActive={onSetActive}
          />
        </div>

        <div className="wf-dock-sig">// nothing is shared without your say-so</div>
      </aside>
    </div>
  );
}
