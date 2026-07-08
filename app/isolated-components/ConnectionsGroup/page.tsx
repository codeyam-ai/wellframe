import { ConnectionsGroup as Component } from "../../../components/dashboard/ConnectionsGroup";
import type { ComponentProps } from "react";
import type { Provider } from "../../../components/dashboard/connections";

type Props = ComponentProps<typeof Component>;

const ai: Provider[] = [
  { id: "claude", name: "Claude", blurb: "Anthropic. Runs privately on this machine. Nothing leaves it.", connected: true, detail: "Local · 0 cloud calls" },
  { id: "gemini", name: "Gemini", blurb: "Google's model. Fast, good with plans." },
  { id: "openai", name: "OpenAI", blurb: "ChatGPT models. Broad general knowledge." },
];

const health: Provider[] = [
  { id: "apple", name: "Apple Health", blurb: "Sleep, heart rate, steps from your iPhone or Watch.", connected: true, detail: "Synced 07:02" },
  { id: "garmin", name: "Garmin", blurb: "Runs, HRV, and recovery from your watch." },
  { id: "oura", name: "Oura", blurb: "Overnight sleep and readiness from your ring." },
  { id: "whoop", name: "Whoop", blurb: "Strain and recovery from your band." },
];

const scenarios: Record<string, Props> = {
  // Interactive AI group with Claude connected and the rest available.
  AICoach: {
    title: "Your AI coach",
    lead: "Your coach is powered by an AI model. Pick the one you trust. You can switch anytime.",
    providers: ai,
    interactive: true,
  },
  // Same group with Gemini's row expanded to reveal the connect flow.
  Expanded: {
    title: "Your AI coach",
    lead: "Your coach is powered by an AI model. Pick the one you trust. You can switch anytime.",
    providers: ai,
    interactive: true,
    activeId: "gemini",
  },
  // Non-interactive health group: one synced source, three available.
  HealthData: {
    title: "Health data",
    lead: "Wellframe reads your health data to build each briefing. It stays on this machine.",
    providers: health,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "AICoach" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 432 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
