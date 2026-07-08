import { ConnectionsPanel as Component } from "../../../components/dashboard/ConnectionsPanel";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Populated: Claude + Apple Health already connected, rest available.
  Populated: { open: true },
  // Day-one: fresh strips every connected status so all read as available.
  FreshDayOne: { open: true, fresh: true },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Populated" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // Full-viewport overlay: the panel is a fixed scrim + right-anchored dock.
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf">
        <Component {...props} />
      </div>
    </div>
  );
}
