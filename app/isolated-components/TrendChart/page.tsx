import { TrendChart as Component } from "../../../components/trends/TrendChart";
import type { ComponentProps } from "react";
import type { TrendMetricWithPoints } from "../../../app/lib/trends";

type Props = ComponentProps<typeof Component>;

function chart(
  label: string,
  unit: string | null,
  latest: string,
  delta: string,
  positive: boolean,
  summary: string,
  values: number[],
): TrendMetricWithPoints {
  const buckets = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    id: 1,
    order: 0,
    metricKey: label.toLowerCase(),
    label,
    unit,
    range: "weekly",
    latest,
    delta,
    positive,
    summary,
    points: values.map((v, i) => ({ id: i, metricId: 1, order: i, bucketLabel: buckets[i], value: v })),
  };
}

const scenarios: Record<string, Props> = {
  // Improving metric: mint line, upward trend, positive delta.
  Rising: {
    metric: chart("Sleep", "hrs", "7:18", "▲ 0.4", true, "Up 4 of the last 6 nights. Best stretch in three weeks.", [6.6, 7.1, 6.9, 7.4, 7.0, 7.6, 7.3]),
  },
  // Declining metric: signal-blue line, downward delta.
  Declining: {
    metric: chart("Mileage", "mi", "31.4", "▼ 4.1", false, "A planned down week after the ridge block.", [3.1, 6.2, 0, 8.4, 4.0, 9.7, 0]),
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Rising" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // One chart cell in the trends grid (grid col minmax(340px, 1fr)).
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 380, padding: 1 }}>
        <div className="wf-trends-grid" style={{ gridTemplateColumns: "1fr" }}>
          <Component {...props} />
        </div>
      </div>
    </div>
  );
}
