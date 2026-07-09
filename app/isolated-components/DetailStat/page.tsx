import { DetailStat as Component } from "../../../components/timeline/DetailStat";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // A typical workout stat label/value pair.
  Default: { k: "Distance", val: "8.2 mi" },
  // A longer, mono-formatted duration value.
  LongValue: { k: "Duration", val: "1:49:36" },
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
      <div className="wf" style={{ minHeight: "auto", display: "block", padding: "40px 48px" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
