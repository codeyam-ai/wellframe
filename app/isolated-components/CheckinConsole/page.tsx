import Component from "../../../components/checkin/CheckinConsole";
import type { ComponentProps } from "react";
import type { Mood } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const checkins: Mood[] = [
  { id: 1, occurredAt: "2026-07-07T07:02:00Z", partOfDay: "morning", energy: 3, mood: "Foggy", sleepQuality: 4, soreness: 2, stress: 2, note: "Legs still heavy from the weekend. Coffee first, then an easy shakeout." },
  { id: 2, occurredAt: "2026-07-06T21:14:00Z", partOfDay: "evening", energy: 4, mood: "Content", sleepQuality: null, soreness: 3, stress: 2, note: "Long run in the books. Descent chewed up the quads but the climb felt strong." },
  { id: 3, occurredAt: "2026-07-06T06:58:00Z", partOfDay: "morning", energy: 4, mood: "Ready", sleepQuality: 4, soreness: 1, stress: 1, note: "Big one today. Slept well, weather's cool." },
];

const scenarios: Record<string, Props> = {
  // Form + a trailing history of logged check-ins.
  Logging: { checkins, dateLabel: "Logging", defaultPartOfDay: "morning" },
  // Day-one: form over an empty history.
  Empty: { checkins: [], dateLabel: "Awaiting first check-in", defaultPartOfDay: "evening" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Logging" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // CheckinConsole renders its own full-viewport .wf shell.
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <Component {...props} />
    </div>
  );
}
