// The Goals surface. Lists tracked goals as progress cards, and a slide-in
// composer creates a new goal (the page's primary interaction). Client
// component: owns the composer open state and refreshes the list on create.
// Day-one shows an empty state that opens straight into the composer.
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Metabar } from '@/components/dashboard/Metabar';
import { WF_NAV_LINKS } from '@/components/dashboard/nav';
import { GoalCard } from './GoalCard';
import { GoalComposer } from './GoalComposer';
import { GoalsEmpty } from './GoalsEmpty';
import type { Goal } from '@prisma/client';

export function GoalsConsole({
  goals,
  dateLabel,
  initialComposing = false,
}: {
  goals: Goal[];
  dateLabel: string;
  // Open the composer on first render (?new=1 deep link, or a scenario that
  // captures the composer-open state).
  initialComposing?: boolean;
}) {
  const router = useRouter();
  const [composing, setComposing] = useState(initialComposing);

  function onCreated() {
    setComposing(false);
    router.refresh();
  }

  const isEmpty = goals.length === 0;

  return (
    <div className="wf">
      <Metabar
        dateLabel={dateLabel}
        subject="Goals · Console"
        navLinks={WF_NAV_LINKS.filter((l) => l.href !== '/goals')}
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
