import Component from "../../../components/timeline/EntryDetail";
import type { ComponentProps } from "react";
import type { DailyBriefing, Mood, Workout } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const workout: Workout = {
  id: 1,
  title: "Ridgeline Trail Run",
  typeLabel: "▸ Ridgeline Trail · Z2",
  photoUrl: "/images/trail.jpg",
  distance: "8.2 mi",
  pace: "8:42",
  vertical: "1,240 ft",
  duration: "1:11:20",
  occurredAt: "2026-07-05T07:32:00Z",
  kind: "run",
};

const mood: Mood = {
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

const briefing: DailyBriefing = {
  id: 1,
  date: "2026-07-06",
  dateLabel: "06 Jul · 07:02",
  readinessScore: 82,
  readinessLabel: "Primed",
  readinessDelta: 4,
  headline: "You're cleared for a quality day.",
  statusLine: "PRIMED · +4 VS 7-DAY AVERAGE",
  elevation: "1,240 FT",
  wind: "4 KT",
  windowLabel: "07-10",
  suggestedWorkout: "Execute Zone 2 · 45 min",
  coachMessage: "HRV has climbed three mornings running while sleep held steady.",
  coachDirective: "Zone 2 · 45 min / ~4.5 mi / 64% of plan",
  coachSignature: "local model · 07:02 · 0 cloud calls",
};

const scenarios: Record<string, Props> = {
  // A workout detail: photo plate + full stat set.
  Workout: { data: { kind: "workout", row: workout }, timeStamp: "07:32" },
  // A check-in detail: mood word + 1-5 ratings + note.
  Mood: { data: { kind: "mood", row: mood }, timeStamp: "06:52" },
  // A daily-briefing detail: readiness + coach transmission.
  Briefing: { data: { kind: "briefing", row: briefing }, timeStamp: "07:00" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Workout" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <Component {...props} />
    </div>
  );
}
