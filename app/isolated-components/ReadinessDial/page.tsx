import { ReadinessDial as Component } from "../../../components/dashboard/ReadinessDial";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // High readiness: long arc, "Primed" label.
  Primed: { score: 82, label: "Primed" },
  // Low readiness: short arc, "Compromised" label.
  Compromised: { score: 38, label: "Compromised" },
  // No data yet: dashes in place of the score, no label.
  NoData: { score: null, label: null },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Primed" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // The dial's CSS (.dialwrap) is scoped under .wf-hero — supply that context.
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 360 }}>
        <section className="wf-hero">
          <div className="core">
            <Component {...props} />
          </div>
        </section>
      </div>
    </div>
  );
}
