// Preview fixtures for the browser (codeyam) preview, where the native Tauri
// backend isn't present. Each named fixture is a Trends scenario the way the
// web app's registered scenarios are — Empty (production day-one, no history to
// chart) and Rich (a full multi-metric signal history across every range:
// sleep, HRV, resting HR, mileage, training load). Selected by the
// `?s=<Scenario>` query param so the preview can switch states, mirroring
// codeyam's query-param isolation. The real app reads these states from SQLite.

import type {
  TrendMetric,
  TrendMetricWithPoints,
  TrendPoint,
  TrendsData,
} from './models';

export type ScenarioName = 'Empty' | 'Rich';

// Small builders so the fixtures read as data, not id bookkeeping. Ids are
// assigned monotonically — stable within one module load, which is all the
// preview needs.
let nextMetricId = 0;
let nextPointId = 0;

function chart(
  spec: Omit<TrendMetric, 'id'>,
  labels: string[],
  values: number[],
): TrendMetricWithPoints {
  const id = ++nextMetricId;
  const points: TrendPoint[] = labels.map((bucketLabel, order) => ({
    id: ++nextPointId,
    metricId: id,
    order,
    bucketLabel,
    value: values[order],
  }));
  return { id, ...spec, points };
}

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKS = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'];
const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

const RICH_METRICS: TrendMetricWithPoints[] = [
  // ── Weekly: last seven days ──────────────────────────────────────────────
  chart(
    { order: 0, metricKey: 'sleep', label: 'Sleep', unit: 'hrs', range: 'weekly', latest: '7:24', delta: '▲ 0.3', positive: true, summary: 'Up 4 of 7 nights' },
    WEEK, [7.1, 6.8, 7.5, 7.2, 6.9, 8.1, 7.4],
  ),
  chart(
    { order: 1, metricKey: 'hrv', label: 'HRV', unit: 'ms', range: 'weekly', latest: '68', delta: '▲ 6', positive: true, summary: 'Above your weekly line' },
    WEEK, [58, 55, 61, 63, 60, 66, 68],
  ),
  chart(
    { order: 2, metricKey: 'rhr', label: 'Resting HR', unit: 'bpm', range: 'weekly', latest: '48', delta: '▼ 2', positive: true, summary: 'Settling — 2 bpm below last week' },
    WEEK, [52, 53, 51, 50, 49, 49, 48],
  ),
  chart(
    { order: 3, metricKey: 'mileage', label: 'Mileage', unit: 'mi', range: 'weekly', latest: '8.2', delta: '▲ 1.1', positive: true, summary: 'Building steadily' },
    WEEK, [4.0, 6.2, 0, 8.1, 5.4, 10.2, 8.2],
  ),
  chart(
    { order: 4, metricKey: 'load', label: 'Training Load', unit: null, range: 'weekly', latest: '312', delta: '▲ 22', positive: false, summary: 'Rising — watch recovery' },
    WEEK, [210, 250, 180, 300, 260, 340, 312],
  ),

  // ── Monthly: trailing six weeks ──────────────────────────────────────────
  chart(
    { order: 0, metricKey: 'sleep', label: 'Sleep', unit: 'hrs', range: 'monthly', latest: '7:18', delta: '▲ 0.2', positive: true, summary: 'Averaging above 7h' },
    WEEKS, [6.9, 7.0, 7.2, 7.1, 7.3, 7.3],
  ),
  chart(
    { order: 1, metricKey: 'hrv', label: 'HRV', unit: 'ms', range: 'monthly', latest: '64', delta: '▲ 9', positive: true, summary: 'Recovering trend' },
    WEEKS, [55, 57, 59, 61, 62, 64],
  ),
  chart(
    { order: 2, metricKey: 'rhr', label: 'Resting HR', unit: 'bpm', range: 'monthly', latest: '49', delta: '▼ 3', positive: true, summary: 'Lower week over week' },
    WEEKS, [52, 52, 51, 50, 50, 49],
  ),
  chart(
    { order: 3, metricKey: 'mileage', label: 'Mileage', unit: 'mi', range: 'monthly', latest: '38', delta: '▲ 12', positive: true, summary: 'Volume climbing' },
    WEEKS, [22, 26, 24, 31, 34, 38],
  ),
  chart(
    { order: 4, metricKey: 'load', label: 'Training Load', unit: null, range: 'monthly', latest: '298', delta: '▲ 40', positive: false, summary: 'Trending up — hold intensity' },
    WEEKS, [230, 248, 240, 270, 285, 298],
  ),

  // ── Yearly: trailing six months ──────────────────────────────────────────
  chart(
    { order: 0, metricKey: 'sleep', label: 'Sleep', unit: 'hrs', range: 'yearly', latest: '7:12', delta: '▲ 0.4', positive: true, summary: 'Best half-year yet' },
    MONTHS, [6.7, 6.9, 7.0, 7.1, 7.1, 7.2],
  ),
  chart(
    { order: 1, metricKey: 'hrv', label: 'HRV', unit: 'ms', range: 'yearly', latest: '61', delta: '▲ 11', positive: true, summary: 'Steady long-term gain' },
    MONTHS, [50, 52, 54, 57, 59, 61],
  ),
  chart(
    { order: 2, metricKey: 'rhr', label: 'Resting HR', unit: 'bpm', range: 'yearly', latest: '50', delta: '▼ 4', positive: true, summary: 'Aerobic base deepening' },
    MONTHS, [54, 53, 52, 52, 51, 50],
  ),
  chart(
    { order: 3, metricKey: 'mileage', label: 'Mileage', unit: 'mi', range: 'yearly', latest: '152', delta: '▲ 34', positive: true, summary: 'Season base built' },
    MONTHS, [96, 110, 118, 132, 141, 152],
  ),
  chart(
    { order: 4, metricKey: 'load', label: 'Training Load', unit: null, range: 'yearly', latest: '286', delta: '▲ 30', positive: false, summary: 'Managed climb' },
    MONTHS, [232, 244, 250, 262, 275, 286],
  ),
];

const RICH: TrendsData = {
  metrics: RICH_METRICS,
  dateLabel: 'Trailing history',
  initialRange: 'weekly',
};

const EMPTY: TrendsData = {
  metrics: [],
  dateLabel: 'Awaiting first sync',
  initialRange: 'weekly',
};

export const FIXTURES: Record<ScenarioName, TrendsData> = {
  Empty: EMPTY,
  Rich: RICH,
};
