import { Rating as Component } from "../../../components/timeline/Rating";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // A mid-range self-rating (4 of 5 ticks filled).
  Default: { label: "Energy", value: 4 },
  // A low rating exercises the mostly-empty track.
  Low: { label: "Stress", value: 2 },
  // A max rating fills every tick.
  Full: { label: "Sleep", value: 5 },
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
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 420, padding: "40px 48px" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
