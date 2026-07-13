// Day-one empty state for the Trends surface: nothing to chart yet. Serif
// verdict, plain-language copy, and the two entry paths (connect a source, or
// view the timeline). Pure presentational.

export function TrendsEmpty() {
  return (
    <div className="wf-empty">
      <div className="wf-trends-empty">
        <div className="wf-secnum">
          <span className="n">01 /</span> Trends
        </div>
        <h1>No history to chart yet.</h1>
        <p>
          Trends draw themselves once a week or two of readings land. Connect a
          health source or log a few days, and sleep, HRV, resting heart rate,
          mileage, and training load will start plotting here, week over week and
          month over month.
        </p>
        <div className="wf-trends-emptycta">
          <a className="wf-btn" href="/?setup=1">
            Connect a source
          </a>
          <a className="wf-nav-link" href="/timeline">
            View timeline
          </a>
        </div>
      </div>
    </div>
  );
}
