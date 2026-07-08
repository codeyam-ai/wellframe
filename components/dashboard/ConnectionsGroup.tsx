// A titled group of provider rows in the Connections panel (e.g. "Your AI
// coach" or "Health data"). Each row can expand into a ProviderConnectPanel to
// choose a connection method and connect. Connected rows show status + (AI)
// active/disconnect controls.
'use client';

import type { ProviderView, ConnectMethod } from './connections';
import type { ConnectResult } from '@/app/lib/connections.actions';
import { ProviderRow } from './ProviderRow';
import { ProviderConnectPanel } from './ProviderConnectPanel';

export function ConnectionsGroup({
  title,
  lead,
  views,
  expandedId = null,
  onToggle = () => {},
  onConnect = async () => ({ ok: true }),
  onDisconnect = () => {},
  onSetActive = () => {},
}: {
  title: string;
  lead: string;
  views: ProviderView[];
  expandedId?: string | null;
  onToggle?: (id: string) => void;
  onConnect?: (id: string, method: ConnectMethod, value: string) => Promise<ConnectResult>;
  onDisconnect?: (id: string) => void;
  onSetActive?: (id: string) => void;
}) {
  return (
    <section className="wf-conn-group">
      <div className="wf-conn-grouphead">
        <span className="wf-secnum n">{title}</span>
        <p className="wf-conn-lead">{lead}</p>
      </div>
      {views.map((v) => (
        <div key={v.id}>
          <ProviderRow
            view={v}
            expanded={expandedId === v.id}
            onToggle={onToggle}
            onDisconnect={onDisconnect}
            onSetActive={onSetActive}
          />
          {expandedId === v.id && !v.connected && (
            <ProviderConnectPanel view={v} onConnect={onConnect} onCancel={() => onToggle(v.id)} />
          )}
        </div>
      ))}
    </section>
  );
}
