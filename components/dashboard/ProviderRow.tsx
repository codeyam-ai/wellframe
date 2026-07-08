// One provider line in the Connections panel: name + blurb on the left, and
// either a "Connected" status pill or a Connect/Cancel button on the right.
'use client';

import type { Provider } from './connections';

export function ProviderRow({
  p,
  onConnect = () => {},
  isActive = false,
}: {
  p: Provider;
  onConnect?: (id: string) => void;
  isActive?: boolean;
}) {
  return (
    <div className={`wf-conn-row${isActive ? ' is-active' : ''}`}>
      <div className="wf-conn-main">
        <div className="wf-conn-name">{p.name}</div>
        <div className="wf-conn-blurb">{p.blurb}</div>
      </div>
      {p.connected ? (
        <span className="wf-conn-status">
          <span className="wf-conn-dot" />
          {p.detail ?? 'Connected'}
        </span>
      ) : (
        <button className="wf-btn wf-conn-btn" type="button" onClick={() => onConnect(p.id)}>
          {isActive ? 'Cancel' : 'Connect'}
        </button>
      )}
    </div>
  );
}
