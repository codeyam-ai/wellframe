import { GoalCard as Component } from "../../../components/goals/GoalCard";
import type { ComponentProps } from "react";
import type { Goal } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const inProgress: Goal = {
  id: 1, order: 0, title: "Run 1,800 miles this year", category: "distance",
  metric: "Miles", target: 1800, current: 1284, unit: "mi", cadence: "This year",
  dueLabel: "Dec 31", note: null, createdAt: "2026-01-01T08:00:00Z",
};

const complete: Goal = {
  id: 2, order: 1, title: "Meditate daily", category: "habit",
  metric: "Day streak", target: 30, current: 30, unit: "days", cadence: "This month",
  dueLabel: "Complete", note: null, createdAt: "2026-06-11T08:00:00Z",
};

const scenarios: Record<string, Props> = {
  // Mid-progress: signal-blue ring, "to go" remaining.
  InProgress: { goal: inProgress },
  // Reached target: mint ring + Complete badge.
  Complete: { goal: complete },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "InProgress" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // One row in the goals list (max-width 1000 wrap).
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 900, padding: "0 44px" }}>
        <div className="wf-goals-list">
          <Component {...props} />
        </div>
      </div>
    </div>
  );
}
