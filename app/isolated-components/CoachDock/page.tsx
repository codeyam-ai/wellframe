import { CoachDock as Component } from "../../../components/dashboard/CoachDock";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  Open: { open: true },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Open" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // The dock is a fixed-position overlay; give it a full-height dark console
  // backdrop so the scrim reads correctly.
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ width: "100%", minHeight: "100vh" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
