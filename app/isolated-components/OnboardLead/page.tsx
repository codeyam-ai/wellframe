import { OnboardLead as Component } from "../../../components/dashboard/OnboardLead";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The onboarding lead is static — one visual state.
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
  // The lead's headline/body typography is scoped under .wf-empty.
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 520 }}>
        <section className="wf-empty">
          <Component {...props} />
        </section>
      </div>
    </div>
  );
}
