import { RecoveryEmpty as Component } from "../../../components/recovery/RecoveryEmpty";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // Day-one: nothing to recover from yet.
  Default: {},
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
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
