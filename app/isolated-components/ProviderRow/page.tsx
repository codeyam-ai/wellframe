import { ProviderRow as Component } from "../../../components/dashboard/ProviderRow";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Connected source shows the status pill with its sync detail.
  Connected: {
    p: {
      id: "apple",
      name: "Apple Health",
      blurb: "Sleep, heart rate, steps from your iPhone or Watch.",
      connected: true,
      detail: "Synced 07:02",
    },
  },
  // Not-yet-connected source shows the Connect button.
  Disconnected: {
    p: { id: "garmin", name: "Garmin", blurb: "Runs, HRV, and recovery from your watch." },
  },
  // Active row (mid-connect) flips the button to Cancel.
  Active: {
    p: { id: "gemini", name: "Gemini", blurb: "Google's model. Fast, good with plans." },
    isActive: true,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Connected" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 432 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
