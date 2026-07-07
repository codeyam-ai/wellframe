import { VitalsPanel as Component } from "../../../components/dashboard/VitalsPanel";
import type { ComponentProps } from "react";
import type { Vital } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const full: Vital[] = [
  { id: 1, order: 1, label: "HRV", value: "68", unit: "ms", delta: "▲6", trackPct: 78, positive: true },
  { id: 2, order: 2, label: "Resting HR", value: "48", unit: "bpm", delta: null, trackPct: 46, positive: false },
  { id: 3, order: 3, label: "Sleep", value: "7:24", unit: "q88", delta: null, trackPct: 88, positive: true },
  { id: 4, order: 4, label: "Steps", value: "8,240", unit: "82%", delta: null, trackPct: 82, positive: false },
];

const partial: Vital[] = [
  { id: 2, order: 2, label: "Resting HR", value: "51", unit: "bpm", delta: null, trackPct: 52, positive: false },
  { id: 4, order: 4, label: "Steps", value: "5,110", unit: "51%", delta: "▼1,900", trackPct: 51, positive: false },
];

const scenarios: Record<string, Props> = {
  Default: { vitals: full },
  PartialData: { vitals: partial },
  Empty: { vitals: [] },
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
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 780 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
