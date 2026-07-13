// A single trend chart: a soft-filled sparkline over a hairline baseline, with
// the metric label, latest value + delta, x-axis bucket labels, and a one-line
// read. Pure presentational — geometry is computed by the pure `trends.ts`
// helpers so this component just maps data to SVG.

import { buildChartGeometry } from './trends';
import type { TrendMetricWithPoints } from '@/app/lib/trends';

const W = 320;
const H = 96;

export function TrendChart({ metric }: { metric: TrendMetricWithPoints }) {
  const values = metric.points.map((p) => p.value);
  const geo = buildChartGeometry(values, W, H, 8);
  const last = geo.points[geo.points.length - 1];
  const gradId = `wf-trend-grad-${metric.id}`;

  return (
    <article className="wf-trend">
      <div className="wf-trend-head">
        <div>
          <div className="wf-trend-label">{metric.label}</div>
          <div className="wf-trend-latest">
            {metric.latest}
            {metric.unit && <small> {metric.unit}</small>}
          </div>
        </div>
        {metric.delta && (
          <div className={`wf-trend-delta${metric.positive ? ' pos' : ''}`}>
            {metric.delta}
          </div>
        )}
      </div>

      <svg
        className="wf-trend-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${metric.label} ${metric.range} trend`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              stopColor={metric.positive ? 'var(--wf-mint)' : 'var(--wf-sig)'}
              stopOpacity="0.22"
            />
            <stop
              offset="1"
              stopColor={metric.positive ? 'var(--wf-mint)' : 'var(--wf-sig)'}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <line
          className="wf-trend-base"
          x1="0"
          y1={H - 8}
          x2={W}
          y2={H - 8}
        />
        {geo.areaPath && (
          <path d={geo.areaPath} fill={`url(#${gradId})`} stroke="none" />
        )}
        {geo.linePath && (
          <path
            d={geo.linePath}
            fill="none"
            stroke={metric.positive ? 'var(--wf-mint)' : 'var(--wf-sig)'}
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {last && (
          <circle
            cx={last.x}
            cy={last.y}
            r="2.75"
            fill={metric.positive ? 'var(--wf-mint)' : 'var(--wf-sig)'}
          />
        )}
      </svg>

      <div className="wf-trend-axis">
        {metric.points.map((p, i) => (
          <span key={p.id} className={i === 0 || i === metric.points.length - 1 ? 'edge' : ''}>
            {p.bucketLabel}
          </span>
        ))}
      </div>

      {metric.summary && <div className="wf-trend-summary">{metric.summary}</div>}
    </article>
  );
}
