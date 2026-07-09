import { MoodDetail as Component } from "../../../components/timeline/MoodDetail";
import type { ComponentProps } from "react";
import type { Mood } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const morning: Mood = {
  id: 1,
  occurredAt: "2026-07-06T06:52:00Z",
  partOfDay: "morning",
  energy: 4,
  mood: "Steady",
  sleepQuality: 4,
  soreness: 2,
  stress: 2,
  note: "Woke before the alarm, legs feel fresh.",
};

const evening: Mood = {
  id: 2,
  occurredAt: "2026-07-05T21:20:00Z",
  partOfDay: "evening",
  energy: 3,
  mood: "Satisfied",
  sleepQuality: null,
  soreness: 3,
  stress: 2,
  note: "Trail run took more out of me than expected, but a good kind of tired.",
};

const scenarios: Record<string, Props> = {
  // A morning check-in with every rating filled and a note.
  Morning: { m: morning },
  // An evening check-in missing the sleep-quality rating (null-branch coverage).
  Evening: { m: evening },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Morning" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 900, padding: "40px 48px" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
