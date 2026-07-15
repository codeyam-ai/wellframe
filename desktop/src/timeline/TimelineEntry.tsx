// One timeline row, rendered by kind. A workout carries a grayscale photo plate
// (Plinth discipline) like the dashboard Field Log; briefing / mood / weight
// render as compact instrument rows. Time sits in a left mono gutter; the kind
// is a bracket label.
//
// In the web app the whole row was a next/link to `/timeline/${entry.id}`. The
// desktop in-app router lands with the other consoles, so the row renders with
// the same DOM but does not navigate yet.

import { timeLabel, type TimelineEntry as Entry } from './timeline';

export function TimelineEntry({ entry }: { entry: Entry }) {
  const hasPhoto = entry.kind === 'workout' && !!entry.photoUrl;
  return (
    // deferred: detail routing — renders as an inert anchor until the in-app
    // router lands; then this drills into `/timeline/${entry.id}`.
    <a className={`wf-tl-entry wf-tl-entry-${entry.kind}`}>
      <div className="wf-tl-time">{timeLabel(entry.occurredAt)}</div>
      {hasPhoto ? (
        <div className="wf-tl-thumb">
          <div className="img" style={{ backgroundImage: `url('${entry.photoUrl}')` }} />
        </div>
      ) : (
        <div className="wf-tl-rail" aria-hidden="true" />
      )}
      <div className="wf-tl-body">
        <div className="wf-tl-head">
          <h3 className="wf-tl-title">{entry.title}</h3>
          {entry.accent && <span className="wf-tl-tag">{entry.accent}</span>}
        </div>
        {entry.summary && <div className="wf-tl-summary">{entry.summary}</div>}
      </div>
      <div className="wf-tl-go" aria-hidden="true">→</div>
    </a>
  );
}
