import { ReadinessHero as Component } from "../../../components/dashboard/ReadinessHero";
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

const compromised: DailyBriefing = {
  id: 2,
  date: "2026-07-07",
  dateLabel: "07 Jul · 06:48",
  readinessScore: 38,
  readinessLabel: "Compromised",
  readinessDelta: -19,
  headline: "Back off today. *Recover* first.",
  statusLine: "[ COMPROMISED ] · -19 VS 7-DAY AVERAGE",
  elevation: "1,240 FT",
  wind: "11 KT",
  windowLabel: null,
  suggestedWorkout: "▶ Take a recovery walk · 25 min",
  coachMessage: null,
  coachDirective: null,
  coachSignature: null,
};

const scenarios: Record<string, Props> = {
  Primed: { briefing: primed },
  LowReadiness: { briefing: compromised },
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
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 680 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
