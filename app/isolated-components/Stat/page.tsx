import { Stat as Component } from "../../../components/dashboard/Stat";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  Default: { k: "Distance", val: "8.2 mi" },
  LongValue: { k: "Vertical", val: "12,480 ft" },
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
  // Stat's k/val styles are scoped under .wf .field .stats — nest it there so
  // the mono label + value render as they do inside the Field Log.
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", padding: 24 }}>
        <div className="field" style={{ display: "block" }}>
          <div className="stats">
            <Component {...props} />
          </div>
        </div>
      </div>
    </div>
  );
}
