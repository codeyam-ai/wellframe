import Component from "../../../components/recovery/RecoveryConsole";
import type { ComponentProps } from "react";
import type { RecoveryReadFull } from "../../../app/lib/recovery";

type Props = ComponentProps<typeof Component>;

const recovering: NonNullable<RecoveryReadFull> = {
  id: 1,
  date: "2026-07-07",
  dateLabel: "07 Jul · 07:04",
  score: 68,
  label: "Recovering",
  headline: "Your system is still catching up. Keep it easy.",
  statusLine: "RECOVERING · -6 VS 7-DAY AVERAGE",
  summary:
    "Sleep and HRV are holding, but resting heart rate and lingering soreness say the ridge block hasn't fully cleared. A light day keeps the trend moving the right way.",
  factors: [
    { id: 1, recoveryId: 1, order: 0, label: "Sleep", value: "7:18", state: "strong", trackPct: 84, positive: true, detail: "Seven hours and eighteen minutes with a solid deep-sleep block." },
    { id: 2, recoveryId: 1, order: 1, label: "HRV", value: "64 ms", state: "steady", trackPct: 62, positive: false, detail: "Right at your 30-day baseline. Coping with the load rather than thriving on it." },
    { id: 3, recoveryId: 1, order: 2, label: "Resting HR", value: "49 bpm", state: "strained", trackPct: 40, positive: false, detail: "Two beats above your morning floor for the second day running." },
    { id: 4, recoveryId: 1, order: 3, label: "Training Load", value: "312", state: "steady", trackPct: 58, positive: false, detail: "Acute load is finally dropping below chronic, which is what you want mid-taper." },
    { id: 5, recoveryId: 1, order: 4, label: "Soreness", value: "Moderate", state: "strained", trackPct: 45, positive: false, detail: "Quads and calves still reporting from Saturday's descent." },
    { id: 6, recoveryId: 1, order: 5, label: "Stress", value: "Low", state: "strong", trackPct: 78, positive: true, detail: "Life stress is quiet this week, which buys recovery headroom." },
  ],
  actions: [
    { id: 1, recoveryId: 1, order: 0, title: "Easy recovery run", kind: "run", durationLabel: "30–40 min", detail: "Keep it strictly conversational, heart rate under 140. The goal is blood flow to sore legs, not fitness." },
    { id: 2, recoveryId: 1, order: 1, title: "Lower-body mobility", kind: "mobility", durationLabel: "12 min", detail: "Calves, quads, and hip flexors while the tissue is warm. The fastest lever on the soreness signal." },
    { id: 3, recoveryId: 1, order: 2, title: "Front-load hydration", kind: "hydration", durationLabel: "All day", detail: "You trended dry yesterday. Get most fluids in before mid-afternoon so it doesn't cost you sleep." },
    { id: 4, recoveryId: 1, order: 3, title: "Protein at breakfast", kind: "nutrition", durationLabel: "This morning", detail: "Your faster recovery weeks all started with a 30–40g protein breakfast." },
  ],
};

const scenarios: Record<string, Props> = {
  // Rich read with a contributing signal + suggested action expanded.
  Recovering: { recovery: recovering, dateLabel: "07 Jul · 07:04", initialFactorPos: 3, initialActionPos: 1 },
  // Day-one: no read yet.
  Empty: { recovery: null, dateLabel: "Awaiting first sync" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Recovering" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // RecoveryConsole renders its own full-viewport .wf shell.
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <Component {...props} />
    </div>
  );
}
