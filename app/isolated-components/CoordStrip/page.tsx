import { CoordStrip as Component } from "../../../components/dashboard/CoordStrip";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // All three coordinates present.
  Default: {
    coords: [
      ["ELEV", "1,240 FT"],
      ["WIND", "4 KT"],
      ["WINDOW", "07–10"],
    ],
  },
  // Missing optional value (WINDOW null) is dropped — only filled coords show.
  Partial: {
    coords: [
      ["ELEV", "1,240 FT"],
      ["WIND", "11 KT"],
      ["WINDOW", null],
    ],
  },
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
  // The strip's CSS (.coord) is scoped under .wf-hero — supply that context.
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 620 }}>
        <section className="wf-hero">
          <div className="core">
            <Component {...props} />
          </div>
        </section>
      </div>
    </div>
  );
}
