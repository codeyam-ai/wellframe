// The create-a-goal composer: a slide-in panel with the new-goal form (title,
// category, metric, target/current/unit, cadence). Submitting is the Goals
// surface's primary interaction. Owns the form's pending / error state; on
// submit it would persist a new goal, then notify the parent to close and
// refresh.
//
// The create write path is deferred in this port: the web app called a Next
// server action (createGoal). Here onSubmit is an inert no-op — the form
// renders and its fields stay interactive, but nothing is persisted yet. When
// the goals mutations are ported this becomes a Tauri command invocation.

import { useState, type FormEvent } from 'react';
import { GOAL_CATEGORIES } from './goals';

export function GoalComposer({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [pending] = useState(false);
  const [error] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // deferred: becomes a Tauri command. The web app validated the fields with
    // validateGoalInput and called the createGoal server action here, then
    // invoked onCreated() on success. Wire this up when goals mutations land.
    void onCreated;
  }

  return (
    <div
      className="wf-dock-scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <div className="wf-dock wf-dock-wide">
        <div className="wf-dock-head">
          <div className="wf-secnum">
            <span className="n">+ /</span> New Goal
          </div>
          <button
            type="button"
            className="wf-dock-x"
            onClick={() => !pending && onClose()}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="wf-goal-form" onSubmit={onSubmit}>
          <label className="wf-field">
            <span className="wf-field-k">Title</span>
            <input
              className="wf-input"
              name="title"
              placeholder="Run 500 miles this year"
              required
            />
          </label>

          <label className="wf-field">
            <span className="wf-field-k">Category</span>
            <select className="wf-input" name="category" defaultValue="distance">
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="wf-field">
            <span className="wf-field-k">Measured in</span>
            <input className="wf-input" name="metric" placeholder="Miles" />
          </label>

          <div className="wf-field-row">
            <label className="wf-field">
              <span className="wf-field-k">Target</span>
              <input
                className="wf-input"
                name="target"
                type="number"
                step="any"
                min="0"
                placeholder="500"
                required
              />
            </label>
            <label className="wf-field">
              <span className="wf-field-k">Current</span>
              <input
                className="wf-input"
                name="current"
                type="number"
                step="any"
                min="0"
                defaultValue="0"
              />
            </label>
            <label className="wf-field">
              <span className="wf-field-k">Unit</span>
              <input className="wf-input" name="unit" placeholder="mi" />
            </label>
          </div>

          <label className="wf-field">
            <span className="wf-field-k">Cadence</span>
            <input className="wf-input" name="cadence" placeholder="This year" />
          </label>

          {error && <div className="wf-method-err">{error}</div>}

          <div className="wf-method-actions">
            <button type="submit" className="wf-btn p" disabled={pending}>
              {pending ? 'Saving…' : 'Create goal'}
            </button>
            <button
              type="button"
              className="wf-btn"
              onClick={() => !pending && onClose()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
