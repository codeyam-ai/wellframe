'use client';

// Day-one onboarding state — the production default, since the database starts
// empty. The console frame stays intact (metabar + numbered section) so the app
// reads as intentional rather than broken, and invites the first action:
// connect a data source. Plinth discipline — no illustration, mono bracket
// labels do the work.

export function EmptyBriefing({ onQueryCoach = () => {} }: { onQueryCoach?: () => void }) {
  const sources = ['Apple Health', 'Strava', 'Import CSV'];
  return (
    <section className="wf-empty">
      <div className="wf-secnum">01 / Readiness</div>
      <div className="wf-empty-core">
        <div className="wf-empty-dial">
          <span className="ring" />
          <span className="hint">No data yet</span>
        </div>
        <h1>Nothing to brief yet.</h1>
        <p>
          Wellframe reads only what lives on this machine. Connect a source and your
          first briefing appears here, privately.
        </p>
        <div className="wf-empty-sources">
          {sources.map((s) => (
            <button key={s} className="wf-chip" type="button">
              {s}
            </button>
          ))}
        </div>
        <div className="wf-empty-foot">
          <button className="wf-btn p" type="button">
            Connect a source
          </button>
          <button className="wf-btn" type="button" onClick={onQueryCoach}>
            Query coach ⌘K
          </button>
        </div>
      </div>
    </section>
  );
}
