import Component from "../../../components/dashboard/DashboardConsole";
import type { ComponentProps } from "react";
import type { DailyBriefing, Vital, Workout } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const primed: DailyBriefing = {
  id: 1,
  date: "2026-07-06",
  dateLabel: "06 Jul · 07:02",
  readinessScore: 82,
  readinessLabel: "Primed",
  readinessDelta: 4,
  headline: "You're cleared for a *quality* day.",
  statusLine: "[ PRIMED ] · +4 VS 7-DAY AVERAGE",
  elevation: "1,240 FT",
  wind: "4 KT",
  windowLabel: "07–10",
  suggestedWorkout: "▶ Execute Zone 2 · 45 min",
  coachMessage:
    "HRV has climbed three mornings running while sleep held steady. Hold intensity for *Thursday* and arrive fresh at the Ridge Trail Half.",
  coachDirective: "[ Directive ] Zone 2 · 45 min / ~4.5 mi / 64% of plan",
  coachSignature: "// local model · 07:02 · 0 cloud calls",
};

const vitals: Vital[] = [
  { id: 1, order: 1, label: "HRV", value: "68", unit: "ms", delta: "▲6", trackPct: 78, positive: true },
  { id: 2, order: 2, label: "Resting HR", value: "48", unit: "bpm", delta: null, trackPct: 46, positive: false },
  { id: 3, order: 3, label: "Sleep", value: "7:24", unit: "q88", delta: null, trackPct: 88, positive: true },
  { id: 4, order: 4, label: "Steps", value: "8,240", unit: "82%", delta: null, trackPct: 82, positive: false },
];

const workout: Workout = {
  id: 1,
  title: "Ridgeline Trail Run",
  typeLabel: "▸ Ridgeline Trail · Z2",
  photoUrl: "https://loremflickr.com/800/600/trail?lock=5&match=all",
  distance: "8.2 mi",
  pace: "8:42",
  vertical: "1,240 ft",
};

const scenarios: Record<string, Props> = {
  Primed: { briefing: primed, vitals, workout },
  CoachOpen: { briefing: primed, vitals, workout, initialCoachOpen: true },
  Empty: { briefing: null, vitals: [], workout: null },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Primed" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // DashboardConsole renders its own full-viewport .wf shell.
  return (
    <div id="codeyam-capture">
      <div style={{ width: "100%" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
