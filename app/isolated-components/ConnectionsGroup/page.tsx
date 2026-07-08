import { ConnectionsGroup as Component } from "../../../components/dashboard/ConnectionsGroup";
import type { ComponentProps } from "react";
import { AI_PROVIDERS, HEALTH_SOURCES, mergeCatalog } from "../../../components/dashboard/connections";

type Props = ComponentProps<typeof Component>;

const aiConnected = mergeCatalog(AI_PROVIDERS, [
  { providerId: "claude", kind: "ai", method: "mcp", status: "connected", detail: "MCP · local model", endpoint: "http://localhost:8080/mcp", isActiveCoach: true, connectedAt: "2026-07-06T07:02:00Z" },
]);
const aiFresh = mergeCatalog(AI_PROVIDERS, []);
const healthSynced = mergeCatalog(HEALTH_SOURCES, [
  { providerId: "apple", kind: "health", method: "oauth", status: "synced", detail: "Synced 07:02", endpoint: null, isActiveCoach: false, connectedAt: "2026-07-06T07:02:00Z" },
]);

const scenarios: Record<string, Props> = {
  // AI coach group, Claude connected via MCP and set active.
  AICoach: {
    title: "Your AI coach",
    lead: "Your coach is powered by an AI model. Pick the one you trust and choose how to connect.",
    views: aiConnected,
  },
  // Day-one AI group with a row expanded to show the method chooser (Claude
  // supports two methods, so the chooser is shown).
  Expanded: {
    title: "Your AI coach",
    lead: "Your coach is powered by an AI model. Pick the one you trust and choose how to connect.",
    views: aiFresh,
    expandedId: "claude",
  },
  // A single-method provider (Local MCP) auto-selects its method, so the
  // endpoint form renders directly.
  ConnectForm: {
    title: "Your AI coach",
    lead: "Your coach is powered by an AI model. Pick the one you trust and choose how to connect.",
    views: aiFresh,
    expandedId: "mcp-local",
  },
  // Health group with one synced source.
  HealthData: {
    title: "Health data",
    lead: "Wellframe reads your health data to build each briefing. It stays on this machine.",
    views: healthSynced,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "AICoach" } = await searchParams;
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
