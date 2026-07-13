"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TrendRangeSwitcher as Component } from "../../../components/trends/TrendRangeSwitcher";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const noop = () => {};
const allRanges = new Set(["weekly", "monthly", "yearly"]);

const scenarios: Record<string, Props> = {
  // Weekly active, all three ranges available.
  Weekly: { range: "weekly", rangesWithData: allRanges, onRange: noop },
  // Monthly active — the switched state.
  Monthly: { range: "monthly", rangesWithData: allRanges, onRange: noop },
};

function Inner() {
  const s = useSearchParams().get("s") ?? "Weekly";
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "auto", padding: 28 }}>
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
