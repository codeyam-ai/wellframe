import { TrendsEmpty as Component } from "../../../components/trends/TrendsEmpty";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The day-one state: nothing to chart yet.
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
  // TrendsEmpty renders the .wf-empty block; wrap in .wf for the tokens.
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
