// Preview fixtures for the browser (codeyam) preview, where the native Tauri
// backend isn't present. Each named fixture is a Check-in scenario the way the
// web app's registered scenarios are — Empty (production day-one, no check-ins
// logged) and Rich (a trailing history of morning/evening check-ins). Selected
// by the `?s=<Scenario>` query param so the preview can switch states, mirroring
// codeyam's query-param isolation. The real app reads these states from SQLite.

import type { CheckinData } from './models';

export type ScenarioName = 'Empty' | 'Rich';

const RICH: CheckinData = {
  checkins: [
    {
      id: 6,
      occurredAt: '2026-07-14T21:12:00Z',
      partOfDay: 'evening',
      energy: 3,
      mood: 'Spent',
      sleepQuality: null,
      soreness: 4,
      stress: 3,
      note: 'Long meetings drained me, but I got the tempo run in. Quads are tight.',
    },
    {
      id: 5,
      occurredAt: '2026-07-14T07:04:00Z',
      partOfDay: 'morning',
      energy: 4,
      mood: 'Ready',
      sleepQuality: 4,
      soreness: 2,
      stress: 2,
      note: 'Slept through the night. Plan is an easy tempo before the workday.',
    },
    {
      id: 4,
      occurredAt: '2026-07-13T20:48:00Z',
      partOfDay: 'evening',
      energy: 4,
      mood: 'Content',
      sleepQuality: null,
      soreness: 2,
      stress: 2,
      note: 'Good rest day. Walked the ridge loop, stretched, ate well.',
    },
    {
      id: 3,
      occurredAt: '2026-07-13T06:52:00Z',
      partOfDay: 'morning',
      energy: 3,
      mood: 'Foggy',
      sleepQuality: 3,
      soreness: 3,
      stress: 3,
      note: 'Woke up a little heavy. Keeping it to mobility and a short walk.',
    },
    {
      id: 2,
      occurredAt: '2026-07-12T21:30:00Z',
      partOfDay: 'evening',
      energy: 2,
      mood: 'Wiped',
      sleepQuality: null,
      soreness: 5,
      stress: 4,
      note: 'Hard long run this morning caught up with me. Legs are cooked.',
    },
    {
      id: 1,
      occurredAt: '2026-07-12T06:40:00Z',
      partOfDay: 'morning',
      energy: 5,
      mood: 'Charged',
      sleepQuality: 5,
      soreness: 1,
      stress: 1,
      note: 'Best sleep in a week. Long-run day — feeling primed for it.',
    },
  ],
  dateLabel: 'Logging',
  defaultPartOfDay: 'morning',
};

const EMPTY: CheckinData = {
  checkins: [],
  dateLabel: 'Awaiting first check-in',
  defaultPartOfDay: 'morning',
};

export const FIXTURES: Record<ScenarioName, CheckinData> = {
  Empty: EMPTY,
  Rich: RICH,
};
