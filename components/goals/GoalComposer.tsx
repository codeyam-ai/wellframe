// The create-a-goal composer: a slide-in panel with the new-goal form (title,
// category, metric, target/current/unit, cadence). Submitting is the Goals
// surface's primary interaction. Client component: owns the form's pending /
// error state and calls the createGoal server action; on success it notifies
// the parent to close and refresh.
'use client';

import { useState } from 'react';
import { GOAL_CATEGORIES } from './goals';
import { createGoal } from '@/app/lib/goals.actions';

export function GoalComposer({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await createGoal({
      title: String(form.get('title') ?? ''),
      category: String(form.get('category') ?? 'habit'),
      metric: String(form.get('metric') ?? ''),
      target: String(form.get('target') ?? ''),
      current: String(form.get('current') ?? '0'),
      unit: String(form.get('unit') ?? ''),
      cadence: String(form.get('cadence') ?? ''),
    });
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
