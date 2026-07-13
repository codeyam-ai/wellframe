// Day-one empty state for the Goals surface: no goals yet. Serif verdict,
// plain-language copy, and the primary "+ New goal" call to action that opens
// the composer. Pure presentational; the open handler is owned by GoalsConsole.

export function GoalsEmpty({ onNew }: { onNew: () => void }) {
  return (
    <div className="wf-empty">
      <div className="wf-goals-empty">
        <div className="wf-secnum">
          <span className="n">01 /</span> Goals
        </div>
        <h1>Set your first goal.</h1>
        <p>
          Goals turn intention into a number you can watch move. Run 500 miles
          this year, sleep 8 hours, strength train three times a week. Name one
          and Wellframe tracks the progress against it.
        </p>
        <div className="wf-goals-emptycta">
          <button type="button" className="wf-btn p" onClick={onNew}>
            + New goal
          </button>
        </div>
      </div>
    </div>
  );
}
