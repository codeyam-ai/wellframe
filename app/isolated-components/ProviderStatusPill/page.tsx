import { ProviderStatusPill as Component } from "../../../components/dashboard/ProviderStatusPill";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // A connected AI coach's status line.
  Connected: { detail: "MCP · local model" },
  // A synced health source.
  Synced: { detail: "Synced 07:02" },
  // A failed attempt — warning-colored, no dot.
  Error: { detail: "Couldn't reach that address — is your model running?", error: true },
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
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 360 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
