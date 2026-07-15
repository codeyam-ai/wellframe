// Preview fixtures for the browser (codeyam) preview, where the native Tauri
// backend isn't present. Each named fixture is a Timeline scenario the way the
// web app's registered scenarios are — Empty (production day-one, nothing
// logged) and Rich (a full, varied feed: workouts, a daily briefing, morning +
// evening check-ins, and body-weight readings across a couple of days). Selected
// by the `?s=<Scenario>` query param so the preview can switch states, mirroring
// codeyam's query-param isolation. The real app reads these states from SQLite.
//
// The raw source rows are authored here and run through the same pure
// `buildTimeline` the server loader uses, so the grouping + relative-day labels
// ("Today" / "Yesterday") come out exactly as they will in production.

import type { DailyBriefing, Mood, TimelineData, Weight, Workout } from './models';
import { buildTimeline } from './timeline';

export type ScenarioName = 'Empty' | 'Rich';

const RICH_WORKOUTS: Workout[] = [
  {
    id: 1,
    title: 'Ridgeline Trail Run',
    typeLabel: '▸ Ridgeline Trail · Z2',
    photoUrl: null,
    distance: '8.2 mi',
    pace: '8:42',
    vertical: '1,240 ft',
    duration: '1:12:40',
    occurredAt: '2026-07-15T07:14:00Z',
    kind: 'run',
  },
  {
    id: 2,
    title: 'Recovery Spin',
    typeLabel: '▸ Zone 1 · Trainer',
    photoUrl: null,
    distance: '12.4 mi',
    pace: null,
    vertical: null,
    duration: '0:38:00',
    occurredAt: '2026-07-14T17:30:00Z',
    kind: 'ride',
  },
  {
    id: 3,
    title: 'Full-Body Strength',
    typeLabel: '▸ Session A · Push/Pull',
    photoUrl: null,
    distance: null,
    pace: null,
    vertical: null,
    duration: '0:45:00',
    occurredAt: '2026-07-14T06:20:00Z',
    kind: 'strength',
  },
];

const RICH_BRIEFINGS: DailyBriefing[] = [
  {
    id: 1,
    date: '2026-07-15',
    dateLabel: '15 Jul · 07:02',
    readinessScore: 72,
    readinessLabel: 'Primed',
    readinessDelta: 4,
    headline: "You're cleared for a quality day.",
    statusLine: 'PRIMED · +4 VS 7-DAY AVERAGE',
    elevation: '1,240 FT',
    wind: '4 KT',
    windowLabel: '07–10',
    suggestedWorkout: 'Execute Zone 2 · 45 min',
    coachMessage:
      'Resting HR settled overnight and HRV is above your weekly line — the aerobic system is ready.',
    coachDirective: 'Zone 2 · 45 min / ~4.5 mi / 64% of plan',
    coachSignature: 'local model · 07:02 · 0 cloud calls',
  },
];

const RICH_MOODS: Mood[] = [
  {
    id: 1,
    occurredAt: '2026-07-15T07:40:00Z',
    partOfDay: 'morning',
    energy: 4,
    mood: 'Steady',
    sleepQuality: 4,
    soreness: 2,
    stress: 2,
    note: 'Legs felt fresh on the warm-up.',
  },
  {
    id: 2,
    occurredAt: '2026-07-14T21:10:00Z',
    partOfDay: 'evening',
    energy: 3,
    mood: 'Wound down',
    sleepQuality: null,
    soreness: 3,
    stress: 3,
    note: null,
  },
];

const RICH_WEIGHTS: Weight[] = [
  {
    id: 1,
    occurredAt: '2026-07-15T06:50:00Z',
    value: '154.2',
    unit: 'lb',
    delta: '▼0.4',
    positive: true,
  },
  {
    id: 2,
    occurredAt: '2026-07-14T06:45:00Z',
    value: '154.6',
    unit: 'lb',
    delta: '▲0.2',
    positive: false,
  },
];

function toData(
  sources: {
    workouts: Workout[];
    briefings: DailyBriefing[];
    moods: Mood[];
    weights: Weight[];
  },
): TimelineData {
  const days = buildTimeline(sources);
  return {
    days,
    dateLabel: days.length > 0 ? days[0].dateLabel : 'Awaiting first sync',
    initialType: 'all',
    initialQuery: '',
  };
}

const RICH: TimelineData = toData({
  workouts: RICH_WORKOUTS,
  briefings: RICH_BRIEFINGS,
  moods: RICH_MOODS,
  weights: RICH_WEIGHTS,
});

const EMPTY: TimelineData = toData({
  workouts: [],
  briefings: [],
  moods: [],
  weights: [],
});

export const FIXTURES: Record<ScenarioName, TimelineData> = {
  Empty: EMPTY,
  Rich: RICH,
};
