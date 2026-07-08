import { MethodChooser as Component } from "../../../components/dashboard/MethodChooser";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Two methods offered, none selected yet.
  Default: { methods: ["oauth", "apiKey"], selected: null },
  // A method selected (highlighted).
  Selected: { methods: ["oauth", "apiKey"], selected: "apiKey" },
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
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 432 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
