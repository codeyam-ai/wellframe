"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GoalComposer as Component } from "../../../components/goals/GoalComposer";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const noop = () => {};

const scenarios: Record<string, Props> = {
  // The create-a-goal slide-in composer, open.
  Open: { onClose: noop, onCreated: noop },
};

function Inner() {
  const s = useSearchParams().get("s") ?? "Open";
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // The composer is a fixed-position overlay; give it a full-height backdrop.
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ width: "100%", minHeight: "100vh" }}>
        <Component {...props} />
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
