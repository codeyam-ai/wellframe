// Quiet empty state for the recent-check-ins history: a mono bracket label plus
// a line of plain-language copy. Shown under the form on day one, when no
// check-in has been logged yet. Pure presentational.

export function CheckinEmpty() {
  return (
    <div className="wf-ci-empty">
      <span className="wf-empty-label">no check-ins logged yet</span>
      <p>
        Your first entry starts the record. Morning and evening check-ins become a
        searchable log the coach reads to spot how energy, sleep, and stress move
        together.
      </p>
    </div>
  );
}
