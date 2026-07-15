// The Weekly / Monthly / Yearly switcher for the Trends surface — the page's
// primary interaction. A ranges-with-data set disables empty ranges so the user
// can never land on a blank view. Pure presentational; the active range and the
// setter are owned by TrendsConsole.

import { TREND_RANGES, rangeLabel, type TrendRange } from './trends';

export function TrendRangeSwitcher({
  range,
  rangesWithData,
  onRange,
}: {
  range: TrendRange;
  rangesWithData: Set<string>;
  onRange: (range: TrendRange) => void;
}) {
  return (
    <div className="wf-range" role="group" aria-label="Trend range">
      {TREND_RANGES.map((r) => {
        const enabled = rangesWithData.has(r);
        return (
          <button
            key={r}
            type="button"
            className={`wf-range-chip${r === range ? ' is-active' : ''}`}
            onClick={() => enabled && onRange(r)}
            disabled={!enabled}
            aria-pressed={r === range}
          >
            {rangeLabel(r)}
          </button>
        );
      })}
    </div>
  );
}
