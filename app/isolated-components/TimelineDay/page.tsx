import { TimelineDay as Component } from "../../../components/timeline/TimelineDay";
import type { ComponentProps } from "react";
import type { TimelineDay, TimelineEntry } from "../../../components/timeline/timeline";

type Props = ComponentProps<typeof Component>;

const entries: TimelineEntry[] = [
  {
    id: "workout-1", kind: "workout", dbId: 1, occurredAt: "2026-07-06T07:14:00Z",
    title: "Zone 2 Base Run", summary: "4.6 mi · 9:05 · 180 ft · 41:48",
    accent: "▸ River Path · Z2", photoUrl: "/images/running.jpg", filterKey: "run",
  },
  {
    id: "briefing-1", kind: "briefing", dbId: 1, occurredAt: "2026-07-06T07:00:00Z",
    title: "You're cleared for a quality day.", summary: "Primed · PRIMED · +4 VS 7-DAY AVERAGE",
    accent: "Readiness 82", filterKey: "briefing",
  },
  {
    id: "mood-1", kind: "mood", dbId: 1, occurredAt: "2026-07-06T06:52:00Z",
    title: "Morning check-in", summary: "Energy 4 · Steady · Woke before the alarm, legs feel fresh.",
    accent: "Morning", filterKey: "mood",
  },
  {
    id: "weight-1", kind: "weight", dbId: 1, occurredAt: "2026-07-06T06:40:00Z",
    title: "Body weight", summary: "154.2 lb · ▼0.4", accent: "Weight", filterKey: "weight",
  },
];

const today: TimelineDay = { key: "2026-07-06", dateLabel: "Today", entries };
const single: TimelineDay = { key: "2026-07-03", dateLabel: "Fri Jul 3", entries: [entries[2]] };

const scenarios: Record<string, Props> = {
  // A busy day: four entries spanning all four kinds (plural count header).
  Default: { day: today },
  // A quiet day with a single entry (singular count header).
  SingleEntry: { day: single },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Default" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 1000, padding: "24px 44px" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
