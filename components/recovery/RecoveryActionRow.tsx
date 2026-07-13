// One suggested-recovery-action row in the Recovery Center: kind, title, and an
// optional duration. Expanding the row reveals why it's suggested — the
// surface's primary interaction. Pure presentational; the open state and toggle
// are owned by RecoveryConsole.

import { actionKindLabel } from './recovery';
import type { RecoveryAction } from '@prisma/client';

export function RecoveryActionRow({
  action,
  open,
  onToggle,
}: {
  action: RecoveryAction;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`wf-rec-action${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="wf-rec-action-btn"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="wf-rec-akind">{actionKindLabel(action.kind)}</span>
        <span className="wf-rec-atitle">{action.title}</span>
        {action.durationLabel && (
          <span className="wf-rec-adur">{action.durationLabel}</span>
        )}
        <span className="wf-rec-chevron">{open ? '−' : '+'}</span>
      </button>
      {open && action.detail && (
        <div className="wf-rec-action-detail">{action.detail}</div>
      )}
    </div>
  );
}
