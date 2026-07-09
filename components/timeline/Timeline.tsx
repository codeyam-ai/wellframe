// The Activity Timeline surface. Client component: owns the active type chip +
// search query (seeded from the URL so a scenario can capture a filtered view),
// derives the chip set from the data present, filters the day groups, and
// renders the filters + days. Two quiet states: nothing seeded (day-one) and
// nothing matching the current filter.

'use client';

import { useMemo, useState } from 'react';
import { Metabar } from '@/components/dashboard/Metabar';
import { TimelineFilters } from './TimelineFilters';
import { TimelineDay } from './TimelineDay';
import { TimelineEmpty } from './TimelineEmpty';
import { deriveChips, entryMatchesFilter, type TimelineDay as Day } from './timeline';

export function Timeline({
  days,
  dateLabel,
  initialType = 'all',
  initialQuery = '',
}: {
  days: Day[];
  dateLabel: string;
  initialType?: string;
  initialQuery?: string;
}) {
  const [type, setType] = useState(initialType);
  const [query, setQuery] = useState(initialQuery);

  const chips = useMemo(() => deriveChips(days), [days]);

  const filteredDays = useMemo(
    () =>
      days
        .map((day) => ({
          ...day,
          entries: day.entries.filter((e) => entryMatchesFilter(e, { type, q: query })),
        }))
        .filter((day) => day.entries.length > 0),
    [days, type, query],
  );

  const isEmpty = days.length === 0;
  const noMatch = !isEmpty && filteredDays.length === 0;

  return (
    <div className="wf">
      <Metabar dateLabel={dateLabel} subject="Activity · Timeline" />

      {isEmpty ? (
        <TimelineEmpty />
      ) : (
        <div className="wf-tl-wrap">
          <div className="wf-secnum">01 / Activity</div>
          <TimelineFilters
            chips={chips}
            activeType={type}
            query={query}
            onType={setType}
            onQuery={setQuery}
          />
          {noMatch ? (
            <div className="wf-tl-nomatch">[ no matching activity ]</div>
          ) : (
            <div className="wf-tl-days">
              {filteredDays.map((day) => (
                <TimelineDay key={day.key} day={day} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Timeline;
