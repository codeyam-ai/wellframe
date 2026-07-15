// The Trends surface — desktop port. Loads every metric chart, and the range
// switcher (Weekly / Monthly / Yearly) re-scopes which charts render — the
// page's primary interaction. Owns the selected-range state locally (view
// state, not a DB mutation), so the switcher stays fully interactive under
// Tauri and in the browser preview. When there is no history at all, it shows
// the day-one empty state.

import { useMemo, useState } from 'react';
import { Metabar } from '../dashboard/Metabar';
import { WF_NAV_LINKS } from '../dashboard/nav';
import { TrendChart } from './TrendChart';
import { TrendRangeSwitcher } from './TrendRangeSwitcher';
import { TrendsEmpty } from './TrendsEmpty';
import { normalizeRange, rangeLabel, type TrendRange } from './trends';
import type { TrendMetricWithPoints } from './models';

export function TrendsConsole({
  metrics,
  dateLabel,
  initialRange = 'weekly',
}: {
  metrics: TrendMetricWithPoints[];
  dateLabel: string;
  initialRange?: string;
}) {
  const [range, setRange] = useState<TrendRange>(normalizeRange(initialRange));

  // Which ranges actually have data — used to disable empty switcher chips so a
  // sparse scenario never lands the user on a blank range.
  const rangesWithData = useMemo(
    () => new Set(metrics.map((m) => m.range)),
    [metrics],
  );
  const visible = useMemo(
    () => metrics.filter((m) => m.range === range),
    [metrics, range],
  );

  const hasAnyData = metrics.length > 0;

  return (
    <div className="wf">
      <Metabar
        dateLabel={dateLabel}
        subject="Trends · Console"
        navLinks={WF_NAV_LINKS.filter((l) => l.href !== '/trends')}
      />

      {hasAnyData ? (
        <div className="wf-trends-wrap">
          <div className="wf-trends-top">
            <div className="wf-secnum">
              <span className="n">01 /</span> Trends · Signal History
            </div>
            <TrendRangeSwitcher
              range={range}
              rangesWithData={rangesWithData}
              onRange={setRange}
            />
          </div>

          {visible.length > 0 ? (
            <div className="wf-trends-grid">
              {visible.map((m) => (
                <TrendChart key={m.id} metric={m} />
              ))}
            </div>
          ) : (
            <div className="wf-trends-nomatch">
              No {rangeLabel(range).toLowerCase()} history yet
            </div>
          )}
        </div>
      ) : (
        <TrendsEmpty />
      )}
    </div>
  );
}

export default TrendsConsole;
