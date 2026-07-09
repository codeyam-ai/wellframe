import { BriefingDetail as Component } from "../../../components/timeline/BriefingDetail";
import type { ComponentProps } from "react";
import type { DailyBriefing } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const primed: DailyBriefing = {
  id: 1,
  date: "2026-07-06",
  dateLabel: "06 Jul · 07:02",
  readinessScore: 82,
  readinessLabel: "Primed",
  readinessDelta: 4,
  headline: "You're cleared for a quality day.",
  statusLine: "PRIMED · +4 VS 7-DAY AVERAGE",
  elevation: "1,240 FT",
  wind: "4 KT",
  windowLabel: "07-10",
  suggestedWorkout: "Execute Zone 2 · 45 min",
  coachMessage: "HRV has climbed three mornings running while sleep held steady.",
  coachDirective: "Zone 2 · 45 min / ~4.5 mi / 64% of plan",
  coachSignature: "local model · 07:02 · 0 cloud calls",
};

const scenarios: Record<string, Props> = {
  // A full primed briefing: readiness kicker, verdict headline, and coach line.
  Default: { b: primed },
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
