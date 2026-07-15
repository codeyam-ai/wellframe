// Preview fixtures for the browser (codeyam) preview, where the native Tauri
// backend isn't present. Each named fixture is a Goals scenario the way the web
// app's registered scenarios are — Empty (production day-one, no goals yet) and
// Rich (several tracked goals rendered as progress rings at varied completion,
// including one already met). Selected by the `?s=<Scenario>` query param so the
// preview can switch states, mirroring codeyam's query-param isolation. The real
// app reads these states from SQLite.

import type { GoalsData } from './models';

export type ScenarioName = 'Empty' | 'Rich';

const RICH: GoalsData = {
  dateLabel: 'Tracking',
  goals: [
    {
      id: 1,
      order: 0,
      title: 'Run 500 miles this year',
      category: 'distance',
      metric: 'Miles',
      target: 500,
      current: 312,
      unit: 'mi',
      cadence: 'This year',
      dueLabel: 'Dec 31',
      note: null,
      createdAt: '2026-01-02T08:00:00Z',
    },
    {
      id: 2,
      order: 1,
      title: 'Complete the fall marathon',
      category: 'race',
      metric: 'Longest run',
      target: 26.2,
      current: 20,
      unit: 'mi',
      cadence: '13 weeks out',
      dueLabel: 'Oct 12',
      note: null,
      createdAt: '2026-03-14T08:00:00Z',
    },
    {
      id: 3,
      order: 2,
      title: 'Sleep 8 hours a night',
      category: 'sleep',
      metric: 'Nights ≥ 8h',
      target: 20,
      current: 11,
      unit: 'nights',
      cadence: 'This month',
      dueLabel: 'Jul 31',
      note: null,
      createdAt: '2026-07-01T08:00:00Z',
    },
    {
      id: 4,
      order: 3,
      title: 'Strength train 3× a week',
      category: 'strength',
      metric: 'Sessions',
      target: 3,
      current: 3,
      unit: 'sessions',
      cadence: 'Weekly',
      dueLabel: 'This week',
      note: null,
      createdAt: '2026-06-08T08:00:00Z',
    },
  ],
};

const EMPTY: GoalsData = {
  dateLabel: 'Awaiting first goal',
  goals: [],
};

export const FIXTURES: Record<ScenarioName, GoalsData> = {
  Empty: EMPTY,
  Rich: RICH,
};
