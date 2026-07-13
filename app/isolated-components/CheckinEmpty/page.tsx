import { CheckinEmpty as Component } from "../../../components/checkin/CheckinEmpty";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The quiet empty history shown under the form on day one.
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
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 680, padding: "0 44px" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
