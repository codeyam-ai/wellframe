"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckinForm as Component } from "../../../components/checkin/CheckinForm";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const noop = () => {};

const scenarios: Record<string, Props> = {
  // Morning check-in: the "Intention" reflection prompt.
  Morning: { partOfDay: "morning", onPartOfDay: noop, onLogged: noop },
  // Evening check-in: the "Reflection" prompt.
  Evening: { partOfDay: "evening", onPartOfDay: noop, onLogged: noop },
};

function Inner() {
  const s = useSearchParams().get("s") ?? "Morning";
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 680, padding: "0 44px" }}>
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
