import { CheckinRow as Component } from "../../../components/checkin/CheckinRow";
import type { ComponentProps } from "react";
import type { Mood } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const withNote: Mood = {
  id: 1, occurredAt: "2026-07-07T07:02:00Z", partOfDay: "morning",
  energy: 3, mood: "Foggy", sleepQuality: 4, soreness: 2, stress: 2,
  note: "Legs still heavy from the weekend. Coffee first, then an easy shakeout.",
};

const minimal: Mood = {
  id: 2, occurredAt: "2026-07-05T20:40:00Z", partOfDay: "evening",
  energy: 5, mood: "Sharp", sleepQuality: null, soreness: null, stress: null, note: null,
};

const scenarios: Record<string, Props> = {
  // Full entry: mood word, wellbeing score, and a reflection note.
  WithNote: { checkin: withNote },
  // Sparse entry: just a mood word and score, no note.
  Minimal: { checkin: minimal },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "WithNote" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  // One row in the recent-check-ins history (max-width 720 wrap).
  return (
    <div id="codeyam-capture" style={{ width: "100%" }}>
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 680, padding: "0 44px" }}>
        <div className="wf-ci-hist">
          <Component {...props} />
        </div>
      </div>
    </div>
  );
}
