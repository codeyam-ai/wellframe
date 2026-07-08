// A titled group of provider rows in the Connections panel (e.g. "Your AI
// coach" or "Health data"). When `interactive` is set, rows toggle open a
// ProviderConnectFlow; otherwise the rows are static (health sources are
// informational for now).
'use client';

import type { Provider } from './connections';
import { ProviderRow } from './ProviderRow';
import { ProviderConnectFlow } from './ProviderConnectFlow';

export function ConnectionsGroup({
  title,
  lead,
  providers,
  interactive = false,
  activeId = null,
  onToggle = () => {},
  onContinue = () => {},
}: {
  title: string;
  lead: string;
  providers: Provider[];
  interactive?: boolean;
  activeId?: string | null;
  onToggle?: (id: string) => void;
  onContinue?: (id: string) => void;
}) {
  return (
    <section className="wf-conn-group">
      <div className="wf-conn-grouphead">
        <span className="wf-secnum n">{title}</span>
        <p className="wf-conn-lead">{lead}</p>
      </div>
      {providers.map((p) => (
        <div key={p.id}>
          <ProviderRow
            p={p}
            onConnect={interactive ? onToggle : () => {}}
            isActive={interactive && activeId === p.id}
          />
          {interactive && activeId === p.id && (
            <ProviderConnectFlow name={p.name} onContinue={() => onContinue(p.id)} />
          )}
        </div>
      ))}
    </section>
  );
}
