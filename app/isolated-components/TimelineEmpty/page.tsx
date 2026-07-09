import { TimelineEmpty as Component } from "../../../components/timeline/TimelineEmpty";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// TimelineEmpty takes no props — the day-one empty state is a single view.
const scenarios: Record<string, Props> = {
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
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
