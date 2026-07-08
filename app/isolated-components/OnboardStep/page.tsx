import { OnboardStep as Component } from "../../../components/dashboard/OnboardStep";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const scenarios: Record<string, Props> = {
  // First step, primary action (filled Connect button).
  Primary: {
    step: {
      n: "01",
      title: "Connect your AI coach",
      body: "Claude, Gemini, or OpenAI. It reads your history and turns it into a plain-language plan each morning.",
      primary: true,
    },
  },
  // Second step, secondary action (outline Connect button).
  Secondary: {
    step: {
      n: "02",
      title: "Connect a health source",
      body: "Apple Health, Garmin, Oura, or Whoop. This is where your overnight vitals come from.",
      primary: false,
    },
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Primary" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 620 }}>
        <div className="wf-onboard-steps">
          <Component {...props} />
        </div>
      </div>
    </div>
  );
}
