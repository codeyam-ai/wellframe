import { ReadinessVerdict as Component } from "../../../components/dashboard/ReadinessVerdict";
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
  headline: "You're cleared for a *quality* day.",
  statusLine: "[ PRIMED ] · +4 VS 7-DAY AVERAGE",
  elevation: "1,240 FT",
  wind: "4 KT",
  windowLabel: "07–10",
  suggestedWorkout: "▶ Execute Zone 2 · 45 min",
  coachMessage: null,
  coachDirective: null,
  coachSignature: null,
};

// No suggested workout: the workout button and the "what does this mean?"
// disclosure both drop, leaving just the verdict + coach button.
const restDay: DailyBriefing = {
  ...primed,
  id: 2,
  headline: "Back off today. *Recover* first.",
  statusLine: "[ COMPROMISED ] · -19 VS 7-DAY AVERAGE",
  readinessScore: 38,
  readinessLabel: "Compromised",
  suggestedWorkout: null,
};

const scenarios: Record<string, Props> = {
  Primed: { briefing: primed },
  NoWorkout: { briefing: restDay },
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
  // The verdict's CSS (.foot, h1, .status, .cta) is scoped under .wf-hero.
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 560 }}>
        <section className="wf-hero">
          <div className="core">
            <Component {...props} />
          </div>
        </section>
      </div>
    </div>
  );
}
