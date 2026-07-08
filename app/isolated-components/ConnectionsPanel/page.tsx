import { ConnectionsPanel as Component } from "../../../components/dashboard/ConnectionsPanel";
import type { ComponentProps } from "react";
import { AI_PROVIDERS, HEALTH_SOURCES, mergeCatalog } from "../../../components/dashboard/connections";

type Props = ComponentProps<typeof Component>;

const populatedRows = [
  { providerId: "claude", kind: "ai" as const, method: "mcp" as const, status: "connected" as const, detail: "MCP · local model", endpoint: "http://localhost:8080/mcp", isActiveCoach: true, connectedAt: "2026-07-06T07:02:00Z" },
  { providerId: "apple", kind: "health" as const, method: "oauth" as const, status: "synced" as const, detail: "Synced 07:02", endpoint: null, isActiveCoach: false, connectedAt: "2026-07-06T07:02:00Z" },
];

const scenarios: Record<string, Props> = {
  // Populated: Claude connected + active, Apple Health synced, rest available.
  Populated: {
    open: true,
    aiViews: mergeCatalog(AI_PROVIDERS, populatedRows),
    healthViews: mergeCatalog(HEALTH_SOURCES, populatedRows),
  },
  // Day-one: nothing connected, everything shows Connect.
  FreshDayOne: {
    open: true,
    aiViews: mergeCatalog(AI_PROVIDERS, []),
    healthViews: mergeCatalog(HEALTH_SOURCES, []),
  },
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
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf">
        <Component {...props} />
      </div>
    </div>
  );
}
