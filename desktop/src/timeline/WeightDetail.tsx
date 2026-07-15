// Body-weight entry detail: the reading in large tabular type plus its trend
// delta (mint when a good move, signal-blue otherwise).

import type { Weight } from './models';

export function WeightDetail({ w }: { w: Weight }) {
  return (
    <div className="wf-tl-detail wf-tl-detail-single">
      <div className="wf-tl-dbody">
        <div className="wf-tl-dkicker">[ Body weight ]</div>
        <h1 className="wf-tl-dbig">
          {w.value}
          <span className="unit"> {w.unit}</span>
        </h1>
        {w.delta && (
          <div className={`wf-tl-ddelta${w.positive ? ' pos' : ''}`}>{w.delta} vs previous</div>
        )}
      </div>
    </div>
  );
}
