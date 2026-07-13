"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RecoveryFactorRow as Component } from "../../../components/recovery/RecoveryFactorRow";
import type { ComponentProps } from "react";
import type { RecoveryFactor } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const noop = () => {};

const strong: RecoveryFactor = {
  id: 1, recoveryId: 1, order: 0, label: "Sleep", value: "7:18", state: "strong",
  trackPct: 84, positive: true,
  detail: "Seven hours and eighteen minutes with a solid deep-sleep block. This is the signal doing the most for you right now.",
};

const strained: RecoveryFactor = {
  id: 3, recoveryId: 1, order: 2, label: "Resting HR", value: "49 bpm", state: "strained",
  trackPct: 40, positive: false,
  detail: "Two beats above your morning floor for the second day running.",
};

const scenarios: Record<string, Props> = {
  // A strong signal, expanded to show its plain-language read.
  StrongOpen: { factor: strong, open: true, onToggle: noop },
  // A strained signal, collapsed.
  Strained: { factor: strained, open: false, onToggle: noop },
};

function Inner() {
  const s = useSearchParams().get("s") ?? "StrongOpen";
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 620, padding: "0 44px" }}>
        <div className="wf-rec-factors">
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
