import { InfoDisclosure as Component } from "../../../components/dashboard/InfoDisclosure";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // The collapsed toggle as it first appears beneath the readiness directive.
  Default: {
    label: "What does this mean?",
    children: (
      <>
        <p>
          <strong>Zone 2</strong> is an easy, conversational pace, steady enough
          that you could talk the whole way. It builds your aerobic base without
          piling on fatigue.
        </p>
        <p>
          Today&apos;s 45-minute session banks training while keeping you fresh
          for Thursday&apos;s Ridge Trail Half.
        </p>
      </>
    ),
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
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 480 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
