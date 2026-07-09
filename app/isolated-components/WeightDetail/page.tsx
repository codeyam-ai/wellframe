import { WeightDetail as Component } from "../../../components/timeline/WeightDetail";
import type { ComponentProps } from "react";
import type { Weight } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const down: Weight = {
  id: 1,
  occurredAt: "2026-07-06T06:40:00Z",
  value: "154.2",
  unit: "lb",
  delta: "▼0.4",
  positive: true,
};

const up: Weight = {
  id: 2,
  occurredAt: "2026-07-04T06:48:00Z",
  value: "154.6",
  unit: "lb",
  delta: "▲0.2",
  positive: false,
};

const scenarios: Record<string, Props> = {
  // A reading trending down, shown with a mint delta.
  Default: { w: down },
  // An upward reading, shown with a signal-blue delta.
  Up: { w: up },
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
