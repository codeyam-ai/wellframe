// One contributing-signal row in the Recovery Center: label, a track bar, the
// formatted value, and its state (strong / steady / strained). Expanding the
// row reveals a plain-language read — the surface's primary interaction. Pure
// presentational; the open state and toggle are owned by RecoveryConsole.

import { clampPct } from '@/components/dashboard/format';
import { isPositiveState, stateLabel } from './recovery';
import type { RecoveryFactor } from '@prisma/client';

export function RecoveryFactorRow({
  factor,
  open,
  onToggle,
}: {
  factor: RecoveryFactor;
  open: boolean;
  onToggle: () => void;
}) {
  const positive = isPositiveState(factor.state);
  return (
    <div className={`wf-rec-factor state-${factor.state}${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="wf-rec-factor-btn"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="wf-rec-fk">{factor.label}</span>
        <span className="wf-rec-track">
          <i
            className={positive ? 'g' : ''}
            style={{ width: `${clampPct(factor.trackPct)}%` }}
          />
        </span>
        <span className="wf-rec-fv">{factor.value}</span>
        <span className="wf-rec-fstate">{stateLabel(factor.state)}</span>
      </button>
      {open && factor.detail && (
        <div className="wf-rec-factor-detail">{factor.detail}</div>
      )}
    </div>
  );
}
