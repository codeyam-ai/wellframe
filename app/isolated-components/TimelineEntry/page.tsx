import { TimelineEntry as Component } from "../../../components/timeline/TimelineEntry";
import type { ComponentProps } from "react";
import type { TimelineEntry } from "../../../components/timeline/timeline";

type Props = ComponentProps<typeof Component>;

const workout: TimelineEntry = {
  id: "workout-1",
  kind: "workout",
  dbId: 1,
  occurredAt: "2026-07-06T07:14:00Z",
  title: "Zone 2 Base Run",
  summary: "4.6 mi · 9:05 · 180 ft · 41:48",
  accent: "▸ River Path · Z2",
  photoUrl: "/images/running.jpg",
  filterKey: "run",
};

const briefing: TimelineEntry = {
  id: "briefing-1",
  kind: "briefing",
  dbId: 1,
  occurredAt: "2026-07-06T07:00:00Z",
  title: "You're cleared for a quality day.",
  summary: "Primed · PRIMED · +4 VS 7-DAY AVERAGE",
  accent: "Readiness 82",
  filterKey: "briefing",
};

const mood: TimelineEntry = {
  id: "mood-1",
  kind: "mood",
  dbId: 1,
  occurredAt: "2026-07-06T06:52:00Z",
  title: "Morning check-in",
  summary: "Energy 4 · Steady · Woke before the alarm, legs feel fresh.",
  accent: "Morning",
  filterKey: "mood",
};

const weight: TimelineEntry = {
  id: "weight-1",
  kind: "weight",
  dbId: 1,
  occurredAt: "2026-07-06T06:40:00Z",
  title: "Body weight",
  summary: "154.2 lb · ▼0.4",
  accent: "Weight",
  filterKey: "weight",
};

const longTitle: TimelineEntry = {
  id: "workout-9",
  kind: "workout",
  dbId: 9,
  occurredAt: "2026-07-02T08:10:00Z",
  title: "Foothills Endurance Ride — County Road 9 Loop with the Saturday Group",
  summary: "31.4 mi · 17.2 mph · 2,180 ft · 1:49:36",
  accent: "▸ County Road 9 · Endurance",
  photoUrl: "/images/trail.jpg",
  filterKey: "ride",
};

const minimal: TimelineEntry = {
  id: "workout-7",
  kind: "workout",
  dbId: 7,
  occurredAt: "2026-07-01T18:00:00Z",
  title: "Evening Walk",
  summary: "",
  filterKey: "walk",
};

const scenarios: Record<string, Props> = {
  // A workout row with its grayscale photo plate and full stat line.
  Workout: { entry: workout },
  // A briefing row (signal-blue rail dot, no photo).
  Briefing: { entry: briefing },
  // A check-in row.
  Mood: { entry: mood },
  // A weight row (mint rail dot).
  Weight: { entry: weight },
  // A very long title exercises wrapping alongside the tag.
  LongTitle: { entry: longTitle },
  // A sparse workout with no summary, accent, or photo.
  Minimal: { entry: minimal },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Workout" } = await searchParams;
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
