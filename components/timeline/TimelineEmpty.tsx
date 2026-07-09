// The Activity Timeline's day-one empty state — the production default before
// any activity has synced. Plinth-quiet: a numbered section and a short serif
// line rather than an illustrated empty state.

export function TimelineEmpty() {
  return (
    <div className="wf-tl-wrap">
      <div className="wf-secnum">01 / Activity</div>
      <div className="wf-tl-empty">
        <h2>Your timeline is quiet.</h2>
        <p>
          Runs, check-ins, and readings will appear here as your day unfolds and
          your sources sync.
        </p>
      </div>
    </div>
  );
}
