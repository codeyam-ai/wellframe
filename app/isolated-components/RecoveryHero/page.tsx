import { RecoveryHero as Component } from "../../../components/recovery/RecoveryHero";
import type { ComponentProps } from "react";
import type { RecoveryFactor } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const factors: RecoveryFactor[] = [
  { id: 1, recoveryId: 1, order: 0, label: "Sleep", value: "7:18", state: "strong", trackPct: 84, positive: true, detail: null },
  { id: 2, recoveryId: 1, order: 1, label: "HRV", value: "64 ms", state: "steady", trackPct: 62, positive: false, detail: null },
  { id: 3, recoveryId: 1, order: 2, label: "Resting HR", value: "49 bpm", state: "strained", trackPct: 40, positive: false, detail: null },
  { id: 4, recoveryId: 1, order: 3, label: "Training Load", value: "312", state: "steady", trackPct: 58, positive: false, detail: null },
  { id: 5, recoveryId: 1, order: 4, label: "Soreness", value: "Moderate", state: "strained", trackPct: 45, positive: false, detail: null },
  { id: 6, recoveryId: 1, order: 5, label: "Stress", value: "Low", state: "strong", trackPct: 78, positive: true, detail: null },
];

const scenarios: Record<string, Props> = {
  // The recovery-score instrument: dial, verdict, and coordinates strip.
  Recovering: {
    score: 68,
    label: "Recovering",
    headline: "Your system is still catching up. Keep it easy.",
    summary: "Sleep and HRV are holding, but resting heart rate and lingering soreness say the ridge block hasn't fully cleared.",
    statusLine: "RECOVERING · -6 VS 7-DAY AVERAGE",
    factors,
  },
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
  // The hero is the left half of the .wf-deck grid; give it that column width.
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 620 }}>
        <div className="wf-deck" style={{ gridTemplateColumns: "1fr" }}>
          <Component {...props} />
        </div>
      </div>
    </div>
  );
}
