// The Activity Timeline filter row: a set of type chips plus a mono search box,
// Plinth-styled. Controlled — the parent Timeline owns the active type + query
// and passes handlers. Chips are bracket labels; the active chip flips to ink.

'use client';

import type { FilterChip } from './timeline';

export function TimelineFilters({
  chips,
  activeType,
  query,
  onType,
  onQuery,
}: {
  chips: FilterChip[];
  activeType: string;
  query: string;
  // Optional so the component renders standalone (e.g. isolated scenarios);
  // the Timeline parent always supplies both.
  onType?: (filterKey: string) => void;
  onQuery?: (q: string) => void;
}) {
  return (
    <div className="wf-tl-filters">
      <div className="wf-tl-chips" role="tablist" aria-label="Filter timeline by type">
        {chips.map((chip) => {
          const active = activeType.toLowerCase() === chip.filterKey.toLowerCase();
          return (
            <button
              key={chip.filterKey}
              type="button"
              role="tab"
              aria-selected={active}
              className={`wf-tl-chip${active ? ' is-active' : ''}`}
              onClick={() => onType?.(chip.filterKey)}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
      <div className="wf-tl-search">
        <span className="wf-tl-search-k">⌕</span>
        <input
          type="search"
          className="wf-tl-search-input"
          placeholder="Search activity"
          value={query}
          onChange={(e) => onQuery?.(e.target.value)}
          aria-label="Search timeline"
        />
      </div>
    </div>
  );
}
