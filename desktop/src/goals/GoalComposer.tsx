// The create-a-goal composer: a slide-in panel with the new-goal form (title,
// category, metric, target/current/unit, cadence). Submitting is the Goals
// surface's primary interaction: the fields are validated with the shared
// `validateGoalInput`, then persisted via the `create_goal` Tauri command
// (a no-op in the browser preview). On success the parent closes + refreshes.

import { useState, type FormEvent } from 'react';
import { GOAL_CATEGORIES, validateGoalInput } from './goals';
import { createGoal } from './data';

export function GoalComposer({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const validated = validateGoalInput({
      title: String(fd.get('title') ?? ''),
      category: String(fd.get('category') ?? ''),
      metric: String(fd.get('metric') ?? ''),
      target: String(fd.get('target') ?? ''),
      current: String(fd.get('current') ?? ''),
      unit: String(fd.get('unit') ?? ''),
      cadence: String(fd.get('cadence') ?? ''),
    });
    if (!validated.ok) {
      setError(validated.error);
      return;
    }
    setPending(true);
    const res = await createGoal(validated.value);
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? 'Could not create the goal.');
      return;
    }
    onCreated();
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
