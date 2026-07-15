// Preview fixtures for the browser (codeyam) preview, where the native Tauri
// backend isn't present. Each named fixture is a Dashboard scenario the way the
// web app's registered scenarios are — Empty (production day-one), Sparse
// (partial overnight data, no workout), Primed (a full briefing). Selected by
// the `?s=<Scenario>` query param so the preview can switch states, mirroring
// codeyam's query-param isolation. The real app reads these states from SQLite.

import type { DashboardData } from './models';

export type ScenarioName = 'Empty' | 'Sparse' | 'Primed';

const PRIMED: DashboardData = {
  briefing: {
    id: 1,
    date: '2026-07-06',
    dateLabel: '06 Jul · 07:02',
    readinessScore: 72,
    readinessLabel: 'Primed',
    readinessDelta: 4,
    headline: "You're *cleared* for a quality day.",
    statusLine: 'PRIMED · +4 VS 7-DAY AVERAGE',
    elevation: '1,240 FT',
    wind: '4 KT',
    windowLabel: '07–10',
    suggestedWorkout: 'Execute Zone 2 · 45 min',
    coachMessage:
      'Resting HR settled overnight and HRV is *above* your weekly line — the aerobic system is ready.',
    coachDirective: 'Zone 2 · 45 min / ~4.5 mi / 64% of plan',
    coachSignature: 'local model · 07:02 · 0 cloud calls',
  },
  vitals: [
    { id: 1, order: 0, label: 'HRV', value: '68', unit: 'ms', delta: '▲6', trackPct: 82, positive: true },
    { id: 2, order: 1, label: 'Resting HR', value: '48', unit: 'bpm', delta: '▼2', trackPct: 74, positive: true },
    { id: 3, order: 2, label: 'Sleep', value: '7:24', unit: null, delta: null, trackPct: 78, positive: false },
    { id: 4, order: 3, label: 'Steps', value: '8,240', unit: null, delta: null, trackPct: 55, positive: false },
  ],
  workout: {
    id: 1,
    title: 'Ridgeline Trail Run',
    typeLabel: '▸ Ridgeline Trail · Z2',
    photoUrl: null,
    distance: '8.2 mi',
    pace: '8:42',
    vertical: '1,240 ft',
    duration: '1:12:40',
    occurredAt: '2026-07-06T07:14:00Z',
    kind: 'run',
  },
};

const SPARSE: DashboardData = {
  briefing: {
    id: 2,
    date: '2026-07-06',
    dateLabel: '06 Jul · 06:41',
    readinessScore: 61,
    readinessLabel: 'Steady',
    readinessDelta: -3,
    headline: 'A *steady* day — keep it easy.',
    statusLine: 'STEADY · -3 VS 7-DAY AVERAGE',
    elevation: null,
    wind: null,
    windowLabel: null,
    suggestedWorkout: null,
    coachMessage: null,
    coachDirective: null,
    coachSignature: null,
  },
  vitals: [
    { id: 1, order: 0, label: 'HRV', value: '54', unit: 'ms', delta: '▼4', trackPct: 58, positive: false },
    { id: 2, order: 1, label: 'Sleep', value: '6:12', unit: null, delta: null, trackPct: 61, positive: false },
  ],
  workout: null,
};

const EMPTY: DashboardData = {
  briefing: null,
  vitals: [],
  workout: null,
};

export const FIXTURES: Record<ScenarioName, DashboardData> = {
  Empty: EMPTY,
  Sparse: SPARSE,
  Primed: PRIMED,
};
