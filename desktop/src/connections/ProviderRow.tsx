// One provider line in the Connections panel. Left: name + blurb (with an
// "active coach" tag when it's the chosen AI). Right, depending on state:
//   - connected  → status pill + (AI) Set-active + Disconnect
//   - error      → error pill + Try again
//   - available  → Connect / Cancel toggle

import type { ProviderView } from './connections';
import { ProviderStatusPill } from './ProviderStatusPill';

export function ProviderRow({
  view,
  expanded = false,
  onToggle = () => {},
  onSetActive = () => {},
  onDisconnect = () => {},
}: {
  view: ProviderView;
  expanded?: boolean;
  onToggle?: (id: string) => void;
  onSetActive?: (id: string) => void;
  onDisconnect?: (id: string) => void;
}) {
  const { connection } = view;
  const isError = connection?.status === 'error';
  const canCoach = view.kind === 'ai';

  return (
    <div
      className={`wf-conn-row${expanded ? ' is-active' : ''}${view.isActiveCoach ? ' is-coach' : ''}`}
    >
      <div className="wf-conn-main">
        <div className="wf-conn-name">
          {view.name}
          {view.isActiveCoach && <span className="wf-conn-coachtag">★ Active coach</span>}
        </div>
        <div className="wf-conn-blurb">{view.blurb}</div>
      </div>

      {view.connected ? (
        <div className="wf-conn-actions">
          <ProviderStatusPill detail={connection?.detail ?? 'Connected'} />
          {canCoach && !view.isActiveCoach && (
            <button className="wf-btn wf-conn-btn" type="button" onClick={() => onSetActive(view.id)}>
              Set active
            </button>
          )}
          <button className="wf-conn-link" type="button" onClick={() => onDisconnect(view.id)}>
            Disconnect
          </button>
        </div>
      ) : isError ? (
        <div className="wf-conn-actions">
          <ProviderStatusPill detail={connection?.detail ?? 'Connection error'} error />
          <button className="wf-btn wf-conn-btn" type="button" onClick={() => onToggle(view.id)}>
            {expanded ? 'Cancel' : 'Try again'}
          </button>
        </div>
      ) : (
        <button className="wf-btn wf-conn-btn" type="button" onClick={() => onToggle(view.id)}>
          {expanded ? 'Cancel' : 'Connect'}
        </button>
      )}
    </div>
  );
}
