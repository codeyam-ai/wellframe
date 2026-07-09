import Component from "../../../components/timeline/Timeline";
import type { ComponentProps } from "react";
import type { TimelineDay, TimelineEntry } from "../../../components/timeline/timeline";

type Props = ComponentProps<typeof Component>;

const e = (over: Partial<TimelineEntry> & Pick<TimelineEntry, "id" | "kind" | "occurredAt" | "title" | "filterKey">): TimelineEntry => ({
  dbId: 1, summary: "", ...over,
});

const days: TimelineDay[] = [
  {
    key: "2026-07-06",
    dateLabel: "Today",
    entries: [
      e({ id: "workout-1", kind: "workout", occurredAt: "2026-07-06T07:14:00Z", title: "Zone 2 Base Run", summary: "4.6 mi · 9:05 · 180 ft · 41:48", accent: "▸ River Path · Z2", photoUrl: "/images/running.jpg", filterKey: "run" }),
      e({ id: "briefing-1", kind: "briefing", occurredAt: "2026-07-06T07:00:00Z", title: "You're cleared for a quality day.", summary: "Primed · PRIMED · +4 VS 7-DAY AVERAGE", accent: "Readiness 82", filterKey: "briefing" }),
      e({ id: "mood-1", kind: "mood", occurredAt: "2026-07-06T06:52:00Z", title: "Morning check-in", summary: "Energy 4 · Steady · Woke before the alarm, legs feel fresh.", accent: "Morning", filterKey: "mood" }),
      e({ id: "weight-1", kind: "weight", occurredAt: "2026-07-06T06:40:00Z", title: "Body weight", summary: "154.2 lb · ▼0.4", accent: "Weight", filterKey: "weight" }),
    ],
  },
  {
    key: "2026-07-05",
    dateLabel: "Yesterday",
    entries: [
      e({ id: "mood-2", kind: "mood", occurredAt: "2026-07-05T21:20:00Z", title: "Evening check-in", summary: "Energy 3 · Satisfied · A good kind of tired.", accent: "Evening", filterKey: "mood" }),
      e({ id: "workout-2", kind: "workout", occurredAt: "2026-07-05T07:32:00Z", title: "Ridgeline Trail Run", summary: "8.2 mi · 8:42 · 1,240 ft · 1:11:20", accent: "▸ Ridgeline Trail · Z2", photoUrl: "/images/trail.jpg", filterKey: "run" }),
    ],
  },
];

const scenarios: Record<string, Props> = {
  // The populated feed: two day groups spanning all four entry kinds.
  RichWeek: { days, dateLabel: "Today", initialType: "all", initialQuery: "" },
  // The Runs chip pre-selected — only run workouts remain.
  FilteredRuns: { days, dateLabel: "Today", initialType: "run", initialQuery: "" },
  // The day-one empty state (no seeded data).
  Empty: { days: [], dateLabel: "Awaiting first sync", initialType: "all", initialQuery: "" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "RichWeek" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <Component {...props} />
    </div>
  );
}
