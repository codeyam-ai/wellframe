"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GoalsEmpty as Component } from "../../../components/goals/GoalsEmpty";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const noop = () => {};

const scenarios: Record<string, Props> = {
  // Day-one: set your first goal, with the primary CTA.
  Default: { onNew: noop },
};

function Inner() {
  const s = useSearchParams().get("s") ?? "Default";
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%" }}>
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
