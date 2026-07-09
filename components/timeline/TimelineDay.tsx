// A single day group in the Activity Timeline: a Plinth section-numeral-style
// date header (label + entry count bracket) followed by that day's entries.

import { TimelineEntry } from './TimelineEntry';
import type { TimelineDay as Day } from './timeline';

export function TimelineDay({ day }: { day: Day }) {
  return (
    <section className="wf-tl-day">
      <header className="wf-tl-dayhead">
        <span className="wf-tl-daylabel">{day.dateLabel}</span>
        <span className="wf-tl-daycount">
          [ {day.entries.length} {day.entries.length === 1 ? 'entry' : 'entries'} ]
        </span>
      </header>
      <div className="wf-tl-entries">
        {day.entries.map((entry) => (
          <TimelineEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}
