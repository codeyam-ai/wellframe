"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RatingScale as Component } from "../../../components/checkin/RatingScale";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const noop = () => {};

const scenarios: Record<string, Props> = {
  // A rated scale: four of five ticks lit, value word shown.
  Rated: { label: "Energy", value: 4, onSet: noop },
  // Not yet rated: empty ticks, em-dash value.
  Unrated: { label: "Soreness", value: null, onSet: noop },
};

function Inner() {
  const s = useSearchParams().get("s") ?? "Rated";
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 620, padding: 28 }}>
        <div className="wf-ci-ratings">
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
