// The Goals surface — desktop port. Lists tracked goals as progress cards, and
// a slide-in composer creates a new goal (the page's primary interaction). Owns
// the composer open state. Day-one shows an empty state that opens straight
// into the composer.
//
// The create write path (GoalComposer's submit) is deferred to a follow-up
// cycle where it becomes a Tauri command invocation; the composer renders and
// its fields stay interactive, but nothing is persisted yet. Opening/closing
// the composer is view state and works today.

import { useState } from 'react';
import { Metabar } from '../dashboard/Metabar';
import { WF_NAV_LINKS } from '../dashboard/nav';
import { GoalCard } from './GoalCard';
import { GoalComposer } from './GoalComposer';
import { GoalsEmpty } from './GoalsEmpty';
import type { GoalsData } from './models';

export function GoalsConsole({
  goals,
  dateLabel,
  initialComposing = false,
}: GoalsData) {
  const [composing, setComposing] = useState(initialComposing);

  function onCreated() {
    setComposing(false);
    // deferred: the web app called router.refresh() here to re-read goals after
    // a create. Under Tauri the create becomes a command and the list is
    // re-fetched then.
  }

  const isEmpty = goals.length === 0;

  return (
    <div className="wf">
      <Metabar
        dateLabel={dateLabel}
        subject="Goals · Console"
        navLinks={WF_NAV_LINKS}
      />

      {isEmpty ? (
        <GoalsEmpty onNew={() => setComposing(true)} />
      ) : (
        <div className="wf-goals-wrap">
          <div className="wf-goals-top">
            <div className="wf-secnum">
              <span className="n">01 /</span> Goals · {goals.length} tracked
            </div>
            <button
              type="button"
              className="wf-btn"
              onClick={() => setComposing(true)}
            >
              + New goal
            </button>
          </div>
          <div className="wf-goals-list">
            {goals.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      {composing && (
        <GoalComposer onClose={() => setComposing(false)} onCreated={onCreated} />
      )}
    </div>
  );
}

export default GoalsConsole;
