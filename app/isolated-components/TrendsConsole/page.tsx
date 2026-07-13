import Component from "../../../components/trends/TrendsConsole";
import type { ComponentProps } from "react";
import type { TrendMetricWithPoints } from "../../../app/lib/trends";

type Props = ComponentProps<typeof Component>;

function metric(
  id: number,
  label: string,
  unit: string | null,
  range: string,
  latest: string,
  delta: string,
  positive: boolean,
  summary: string,
  values: number[],
  buckets: string[],
): TrendMetricWithPoints {
  return {
    id,
    order: id,
    metricKey: label.toLowerCase(),
    label,
    unit,
    range,
    latest,
    delta,
    positive,
    summary,
    points: values.map((v, i) => ({
      id: id * 100 + i,
      metricId: id,
      order: i,
      bucketLabel: buckets[i],
      value: v,
    })),
  };
}

const wk = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekly: TrendMetricWithPoints[] = [
  metric(1, "Sleep", "hrs", "weekly", "7:18", "▲ 0.4", true, "Up 4 of the last 6 nights. Best stretch in three weeks.", [6.6, 7.1, 6.9, 7.4, 7.0, 7.6, 7.3], wk),
  metric(2, "HRV", "ms", "weekly", "64", "▲ 5", true, "Climbing steadily as load eased mid-week.", [58, 55, 60, 62, 59, 66, 64], wk),
  metric(3, "Resting HR", "bpm", "weekly", "49", "▲ 2", false, "Slightly elevated. Watch for accumulating fatigue.", [47, 46, 48, 47, 49, 48, 49], wk),
  metric(4, "Mileage", "mi", "weekly", "31.4", "▼ 4.1", false, "A planned down week after the ridge block.", [3.1, 6.2, 0, 8.4, 4.0, 9.7, 0], wk),
];

const scenarios: Record<string, Props> = {
  // Rich weekly history across four signals with the range switcher.
  Weekly: { metrics: weekly, dateLabel: "Trailing history", initialRange: "weekly" },
  // Day-one: no readings logged yet.
  Empty: { metrics: [], dateLabel: "Awaiting first sync", initialRange: "weekly" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Weekly" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // TrendsConsole renders its own full-viewport .wf shell.
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <Component {...props} />
    </div>
  );
}
