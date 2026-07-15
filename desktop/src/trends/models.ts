// Local data types for the desktop Trends console. These mirror the web app's
// Prisma models (TrendMetric / TrendPoint) but carry no Prisma/server coupling —
// the native app gets these from a Rust `get_trends` command, and the browser
// preview gets them from fixtures. Field names match the Rust command's
// camelCase serialization so one shape serves both sources.

// One chart for one range. Flat (no FK relation) — points are stitched on in JS.
export interface TrendMetric {
  id: number;
  order: number; // display order within a range
  metricKey: string; // stable key, e.g. "sleep" | "hrv" | "rhr" | "mileage"
  label: string; // "Sleep", "HRV", "Resting HR", "Mileage"
  unit: string | null; // "hrs", "ms", "bpm", "mi"
  range: string; // "weekly" | "monthly" | "yearly"
  latest: string; // formatted latest value, e.g. "7:18"
  delta: string | null; // trend chip, e.g. "▲ 0.4"
  positive: boolean; // mint (improving) vs signal-blue
  summary: string | null; // one-line read, e.g. "Trending up 4 of 6 weeks"
}

// One dated sample within a TrendMetric chart. Flat + ordered so a sparse
// scenario simply seeds fewer points. `metricId` is a plain column (no FK).
export interface TrendPoint {
  id: number;
  metricId: number; // parent TrendMetric.id
  order: number; // left-to-right position
  bucketLabel: string; // x-axis label, e.g. "Mon", "Wk 3", "Mar"
  value: number; // numeric value used to plot the line
}

// A metric with its ordered points attached — one chart's worth of data.
export type TrendMetricWithPoints = TrendMetric & { points: TrendPoint[] };

// The full payload the Trends console renders: every chart across every range
// (the switcher re-scopes them client-side), plus the metabar stamp and the
// initial range to open on.
export interface TrendsData {
  metrics: TrendMetricWithPoints[];
  dateLabel: string;
  initialRange: string;
}
