// One goal, rendered as a hairline-bordered row: progress ring on the left,
// title + metric + progress read in the middle, cadence / due on the right.
// Pure presentational — progress math comes from the pure helpers.

import { GoalRing } from './GoalRing';
import { formatProgress, goalStatus, progressPct, remaining } from './goals';
import type { Goal } from '@prisma/client';

export function GoalCard({ goal }: { goal: Goal }) {
  const pct = progressPct(goal.current, goal.target);
  const status = goalStatus(goal.current, goal.target);
  const left = remaining(goal.current, goal.target);
  const complete = status === 'complete';

  return (
    <article className={`wf-goal${complete ? ' is-complete' : ''}`}>
      <GoalRing pct={pct} complete={complete} />
      <div className="wf-goal-main">
        <div className="wf-goal-cat">{goal.category}</div>
        <h3 className="wf-goal-title">{goal.title}</h3>
        <div className="wf-goal-progress">
          {formatProgress(goal.current, goal.target, goal.unit)}
          <span className="wf-goal-metric"> · {goal.metric}</span>
        </div>
      </div>
      <div className="wf-goal-side">
        {complete ? (
          <span className="wf-goal-badge">✓ Complete</span>
        ) : (
          <span className="wf-goal-left">
            {formatRemaining(left, goal.unit)} to go
          </span>
        )}
        {goal.dueLabel && <span className="wf-goal-due">{goal.dueLabel}</span>}
      </div>
    </article>
  );
}

function formatRemaining(n: number, unit?: string | null): string {
  const rounded = Math.round(n * 10) / 10;
  const num = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return unit ? `${num} ${unit}` : num;
}
