import { WorkoutDetail as Component } from "../../../components/timeline/WorkoutDetail";
import type { ComponentProps } from "react";
import type { Workout } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const trailRun: Workout = {
  id: 1,
  title: "Ridgeline Trail Run",
  typeLabel: "▸ Ridgeline Trail · Z2",
  photoUrl: "/images/trail.jpg",
  distance: "8.2 mi",
  pace: "8:42",
  vertical: "1,240 ft",
  duration: "1:11:20",
  occurredAt: "2026-07-05T07:32:00Z",
  kind: "run",
};

const strength: Workout = {
  id: 2,
  title: "Upper Body + Core",
  typeLabel: "▸ Home Rack · Strength",
  photoUrl: null,
  distance: null,
  pace: null,
  vertical: null,
  duration: "48:10",
  occurredAt: "2026-07-04T17:05:00Z",
  kind: "strength",
};

const scenarios: Record<string, Props> = {
  // A rich run: photo plate plus the full distance/pace/vertical/duration set.
  Default: { w: trailRun },
  // A photo-less strength session that falls back to the duration-only summary.
  NoPhoto: { w: strength },
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
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 900, padding: "40px 48px" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
