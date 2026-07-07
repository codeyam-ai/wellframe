import { EmptyBriefing as Component } from "../../../components/dashboard/EmptyBriefing";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

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
  // Full-height day-one state: keep .wf's default flex column + 100vh so the
  // onboarding content centers exactly as it does in the app.
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ width: "100%" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
