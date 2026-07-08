import { BriefingDeck as Component } from "../../../components/dashboard/BriefingDeck";
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
  coachMessage: "Resting HR held steady through the night and HRV is up six points — your body absorbed Tuesday's session well.",
  coachDirective: "Keep it aerobic today; save the intensity for Thursday's race.",
  coachSignature: "— Coach",
};

const vitals: Vital[] = [
  { id: 1, order: 1, label: "HRV", value: "68", unit: "ms", delta: "▲6", trackPct: 78, positive: true },
  { id: 2, order: 2, label: "Resting HR", value: "48", unit: "bpm", delta: null, trackPct: 46, positive: false },
  { id: 3, order: 3, label: "Sleep", value: "7:24", unit: "q88", delta: null, trackPct: 88, positive: true },
  { id: 4, order: 4, label: "Steps", value: "8,240", unit: "82%", delta: null, trackPct: 82, positive: false },
];

const run: Workout = {
  id: 1,
  title: "Ridgeline Trail Run",
  typeLabel: "▸ Ridgeline Trail · Z2",
  photoUrl: "/images/trail.jpg",
  distance: "8.2 mi",
  pace: "8:42",
  vertical: "1,240 ft",
};

const scenarios: Record<string, Props> = {
  // Full populated deck: hero + vitals + coach transmission + field log.
  Primed: { briefing: primed, vitals, workout: run },
  // Same briefing with no logged workout — the field log shows its empty state.
  NoWorkout: { briefing: primed, vitals, workout: null },
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
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 1200 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
