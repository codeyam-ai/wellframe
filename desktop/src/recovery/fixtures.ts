// Preview fixtures for the browser (codeyam) preview, where the native Tauri
// backend isn't present. Each named fixture is a Recovery Center scenario the
// way the web app's registered scenarios are — Empty (production day-one, no
// signals yet) and Rich (a full recovery read with contributing factors and
// suggested actions). Selected by the `?s=<Scenario>` query param so the preview
// can switch states, mirroring codeyam's query-param isolation. The real app
// reads these states from SQLite.

import type { RecoveryReadFull } from './models';

export type ScenarioName = 'Empty' | 'Rich';

const RICH: RecoveryReadFull = {
  id: 1,
  date: '2026-07-07',
  dateLabel: '07 Jul · 07:04',
  score: 64,
  label: 'Recovering',
  headline: 'Your system is still *catching up*.',
  statusLine: 'RECOVERING · -6 VS 7-DAY AVERAGE',
  summary:
    'Yesterday’s long effort left a mark — sleep and HRV recovered part of the way overnight, but resting heart rate and residual load say your body wants one more easy day before the next hard session.',
  factors: [
    {
      id: 1,
      recoveryId: 1,
      order: 0,
      label: 'Sleep',
      value: '6:41',
      state: 'steady',
      trackPct: 61,
      positive: false,
      detail:
        'You logged 6h 41m against your 7h 30m target — enough to function, short of what full repair asks for after a hard day. One earlier night restores the buffer.',
    },
    {
      id: 2,
      recoveryId: 1,
      order: 1,
      label: 'HRV',
      value: '58 ms',
      state: 'strong',
      trackPct: 78,
      positive: true,
      detail:
        'Overnight HRV climbed back to 58 ms — above your weekly line and the clearest sign the parasympathetic system is doing its job. This is the signal trending in your favour.',
    },
    {
      id: 3,
      recoveryId: 1,
      order: 2,
      label: 'Resting HR',
      value: '52 bpm',
      state: 'strained',
      trackPct: 38,
      positive: false,
      detail:
        'Resting heart rate sat 4 bpm above your baseline through the night — a lingering fingerprint of yesterday’s load. Expect it to settle by tomorrow if today stays easy.',
    },
    {
      id: 4,
      recoveryId: 1,
      order: 3,
      label: 'Training Load',
      value: '+42',
      state: 'strained',
      trackPct: 31,
      positive: false,
      detail:
        'Your acute load is running 42% above the chronic baseline after back-to-back quality days. That gap is exactly what a recovery day is meant to close.',
    },
    {
      id: 5,
      recoveryId: 1,
      order: 4,
      label: 'Stress',
      value: 'Moderate',
      state: 'steady',
      trackPct: 54,
      positive: false,
      detail:
        'Daytime stress markers held in the moderate band — not a drag on recovery, but not helping it either. A short walk or breathwork block nudges this toward strong.',
    },
  ],
  actions: [
    {
      id: 1,
      recoveryId: 1,
      order: 0,
      title: 'Easy recovery run',
      kind: 'run',
      durationLabel: '30–40 min',
      detail:
        'Keep it strictly Zone 1–2 — conversational the whole way. The goal is blood flow to tired legs, not fitness. If heart rate drifts up, walk it back down.',
    },
    {
      id: 2,
      recoveryId: 1,
      order: 1,
      title: 'Hip & hamstring mobility',
      kind: 'mobility',
      durationLabel: '15 min',
      detail:
        'Ten focused minutes on hips, hamstrings, and calves clears the tightness that back-to-back sessions leave behind and keeps tomorrow’s stride honest.',
    },
    {
      id: 3,
      recoveryId: 1,
      order: 2,
      title: 'Front-load hydration',
      kind: 'hydration',
      durationLabel: 'All day',
      detail:
        'Aim for an extra 500 ml before noon with a pinch of electrolytes. Resting HR this elevated often reads as mild dehydration carried over from yesterday.',
    },
    {
      id: 4,
      recoveryId: 1,
      order: 3,
      title: 'Full rest day',
      kind: 'rest',
      durationLabel: null,
      detail:
        'The conservative call: skip the run entirely and let load and resting HR reset on their own. Choose this if legs feel heavy on the first few steps this morning.',
    },
  ],
};

const EMPTY: RecoveryReadFull = null;

export const FIXTURES: Record<ScenarioName, RecoveryReadFull> = {
  Empty: EMPTY,
  Rich: RICH,
};
