import { ProviderRow as Component } from "../../../components/dashboard/ProviderRow";
import type { ComponentProps } from "react";
import type { ProviderView } from "../../../components/dashboard/connections";

type Props = ComponentProps<typeof Component>;

const base: ProviderView = {
  id: "gemini",
  name: "Gemini",
  blurb: "Google's model. Fast, good with plans.",
  kind: "ai",
  methods: ["oauth", "apiKey"],
  connection: null,
  connected: false,
  isActiveCoach: false,
};

const scenarios: Record<string, Props> = {
  // Disconnected — not yet connected, shows the Connect button.
  Disconnected: { view: base },
  // Connected AI provider with a status pill.
  Connected: {
    view: {
      ...base,
      connection: { providerId: "gemini", kind: "ai", method: "apiKey", status: "connected", detail: "Key ••••4f2a", endpoint: null, isActiveCoach: false, connectedAt: "2026-07-06T07:02:00Z" },
      connected: true,
    },
  },
  // Connected AND the active coach.
  Active: {
    view: {
      ...base,
      id: "claude",
      name: "Claude",
      blurb: "Anthropic. Strong reasoning, great at long-term coaching.",
      connection: { providerId: "claude", kind: "ai", method: "mcp", status: "connected", detail: "MCP · local model", endpoint: "http://localhost:8080/mcp", isActiveCoach: true, connectedAt: "2026-07-06T07:02:00Z" },
      connected: true,
      isActiveCoach: true,
    },
  },
  // A failed connection — shows the error pill + Try again.
  Error: {
    view: {
      ...base,
      id: "garmin",
      name: "Garmin",
      blurb: "Runs, HRV, and recovery from your watch.",
      kind: "health",
      connection: { providerId: "garmin", kind: "health", method: "localEndpoint", status: "error", detail: "Couldn't reach that address — is your model running?", endpoint: null, isActiveCoach: false, connectedAt: "2026-07-06T07:02:00Z" },
      connected: false,
    },
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Disconnected" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 460 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
