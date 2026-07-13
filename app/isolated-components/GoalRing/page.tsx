import { GoalRing as Component } from "../../../components/goals/GoalRing";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Partway: signal-blue arc with the percentage centred.
  Partial: { pct: 71, complete: false },
  // Full ring in mint for a completed goal.
  Complete: { pct: 100, complete: true },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Partial" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // Small fixed-size ring (64px in the card).
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "auto", padding: 24 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
