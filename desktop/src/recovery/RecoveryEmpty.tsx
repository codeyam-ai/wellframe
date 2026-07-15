// Day-one empty state for the Recovery Center: nothing to recover from yet.
// Serif verdict, plain-language copy, and the two entry paths. Pure
// presentational.

export function RecoveryEmpty() {
  return (
    <div className="wf-empty">
      <div className="wf-rec-empty">
        <div className="wf-secnum">
          <span className="n">01 /</span> Recovery
        </div>
        <h1>Nothing to recover from yet.</h1>
        <p>
          The Recovery Center reads sleep, HRV, resting heart rate, training
          load, and stress together into one honest picture of how ready your
          body is, with the recovery moves that fit. It fills in once a day or two
          of readings land.
        </p>
        <div className="wf-rec-emptycta">
          <a className="wf-btn" href="/?setup=1">
            Connect a source
          </a>
          <a className="wf-nav-link" href="/trends">
            See trends
          </a>
        </div>
      </div>
    </div>
  );
}
