"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RecoveryActionRow as Component } from "../../../components/recovery/RecoveryActionRow";
import type { ComponentProps } from "react";
import type { RecoveryAction } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const noop = () => {};

const run: RecoveryAction = {
  id: 1, recoveryId: 1, order: 0, title: "Easy recovery run", kind: "run",
  durationLabel: "30–40 min",
  detail: "Keep it strictly conversational, heart rate under 140. The goal is blood flow to sore legs, not fitness. If pace feels embarrassingly slow, that's correct.",
};

const hydration: RecoveryAction = {
  id: 3, recoveryId: 1, order: 2, title: "Front-load hydration", kind: "hydration",
  durationLabel: "All day",
  detail: "You trended dry yesterday. Aim for most of your fluids before mid-afternoon.",
};

const scenarios: Record<string, Props> = {
  // A suggested action, expanded to show why it's suggested.
  Open: { action: run, open: true, onToggle: noop },
  // A suggested action, collapsed.
  Collapsed: { action: hydration, open: false, onToggle: noop },
};

function Inner() {
  const s = useSearchParams().get("s") ?? "Open";
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 620, padding: "0 44px" }}>
        <div className="wf-rec-actions">
          <Component {...props} />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
