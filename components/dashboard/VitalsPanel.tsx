// Overnight vitals telemetry. Each row is a label, a track bar (mint when the
// reading is favorable, signal-blue otherwise), and a formatted value with an
// optional unit and trend chip. Fewer rows = the partial-data scenario.

import type { Vital } from '@prisma/client';
import { clampPct } from './format';

export function VitalsPanel({ vitals }: { vitals: Vital[] }) {
  return (
    <div className="wf-block wf-tele">
      <div className="wf-secnum">02 / Vitals · Overnight</div>
      {vitals.length === 0 ? (
        <div className="wf-empty-label">No overnight readings</div>
      ) : (
        vitals.map((v) => (
          <div className="row" key={v.id}>
            <span className="k">{v.label}</span>
            <span className={`track${v.positive ? ' g' : ''}`}>
              <i style={{ width: `${clampPct(v.trackPct)}%` }} />
            </span>
            <span className="v">
              {v.value}
              {v.unit && <small> {v.unit}</small>}
              {v.delta && <span className="up"> {v.delta}</span>}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
