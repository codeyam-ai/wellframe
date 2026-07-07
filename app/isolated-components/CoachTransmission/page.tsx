import { CoachTransmission as Component } from "../../../components/dashboard/CoachTransmission";
import type { ComponentProps } from "react";
import type { DailyBriefing } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const base: DailyBriefing = {
  id: 1,
  date: "2026-07-06",
  dateLabel: "06 Jul · 07:02",
  readinessScore: 82,
  readinessLabel: "Primed",
  readinessDelta: 4,
  headline: null,
  statusLine: null,
  elevation: null,
  wind: null,
  windowLabel: null,
  suggestedWorkout: null,
  coachMessage:
    "HRV has climbed three mornings running while sleep held steady. Hold intensity for *Thursday* and arrive fresh at the Ridge Trail Half.",
  coachDirective: "[ Directive ] Zone 2 · 45 min / ~4.5 mi / 64% of plan",
  coachSignature: "// local model · 07:02 · 0 cloud calls",
};

const scenarios: Record<string, Props> = {
  Default: { briefing: base },
  NoTransmission: {
    briefing: { ...base, coachMessage: null, coachDirective: null, coachSignature: null },
  },
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
