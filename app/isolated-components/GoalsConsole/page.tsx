import Component from "../../../components/goals/GoalsConsole";
import type { ComponentProps } from "react";
import type { Goal } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

function goal(id: number, title: string, category: string, metric: string, target: number, current: number, unit: string | null, dueLabel: string): Goal {
  return { id, order: id, title, category, metric, target, current, unit, cadence: dueLabel, dueLabel, note: null, createdAt: "2026-01-01T08:00:00Z" };
}

const goals: Goal[] = [
  goal(1, "Run 1,800 miles this year", "distance", "Miles", 1800, 1284, "mi", "Dec 31"),
  goal(2, "Break 1:45 at the Ridge Trail Half", "race", "Race", 1, 0, null, "6 days left"),
  goal(3, "Average 8 hours of sleep", "sleep", "Nights ≥ 8h", 30, 19, "nights", "Jul 31"),
  goal(4, "Strength train 3× a week", "strength", "Sessions", 12, 8, "sessions", "Jul 31"),
  { ...goal(5, "Meditate daily", "habit", "Day streak", 30, 30, "days", "Complete"), dueLabel: "Complete" },
];

const scenarios: Record<string, Props> = {
  // Rich list including one completed goal (mint ring + badge).
  Tracking: { goals, dateLabel: "Tracking" },
  // Day-one: no goals yet.
  Empty: { goals: [], dateLabel: "Awaiting first goal" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Tracking" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // GoalsConsole renders its own full-viewport .wf shell.
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <Component {...props} />
    </div>
  );
}
