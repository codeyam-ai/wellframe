import { ProviderConnectPanel as Component } from "../../../components/dashboard/ProviderConnectPanel";
import type { ComponentProps } from "react";
import { AI_PROVIDERS, mergeCatalog } from "../../../components/dashboard/connections";

type Props = ComponentProps<typeof Component>;

const views = mergeCatalog(AI_PROVIDERS, []);
const claude = views.find((v) => v.id === "claude")!;
const mcp = views.find((v) => v.id === "mcp-local")!;

const scenarios: Record<string, Props> = {
  // Multi-method provider (Claude) → the method chooser is shown first.
  Chooser: { view: claude },
  // Single-method provider (Local MCP) → its endpoint form renders directly.
  SingleMethodForm: { view: mcp },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Chooser" } = await searchParams;
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
