import { MethodForm as Component } from "../../../components/dashboard/MethodForm";
import type { ComponentProps } from "react";
import { METHOD_META } from "../../../components/dashboard/connections";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Paste-key form for a cloud provider.
  ApiKey: { meta: METHOD_META.apiKey, method: "apiKey", value: "", providerName: "Claude" },
  // Local MCP endpoint form with a filled value.
  Endpoint: { meta: METHOD_META.mcp, method: "mcp", value: "http://localhost:8080/mcp", providerName: "Local MCP server" },
  // Inline validation error under the key field.
  Error: {
    meta: METHOD_META.apiKey,
    method: "apiKey",
    value: "sk-1",
    error: "That key looks too short — double-check you copied all of it.",
    providerName: "Gemini",
  },
  // OAuth method needs no input — just a sign-in button.
  SignIn: { meta: METHOD_META.oauth, method: "oauth", value: "", providerName: "Garmin" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "ApiKey" } = await searchParams;
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
