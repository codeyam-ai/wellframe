// Local data types for the desktop Activity Timeline. These mirror the web app's
// Prisma models (Workout / DailyBriefing / Mood / Weight) but carry no
// Prisma/server coupling — the native app gets these from a Rust `get_timeline`
// command, and the browser preview gets them from fixtures. Field names match
// the Rust command's camelCase serialization so one shape serves both sources
// (nullable columns become `| null`).

import type { TimelineDay } from './timeline';

export interface DailyBriefing {
  id: number;
  date: string;
  dateLabel: string;
  readinessScore: number | null;
  readinessLabel: string | null;
  readinessDelta: number | null;
  headline: string | null;
  statusLine: string | null;
  elevation: string | null;
  wind: string | null;
  windowLabel: string | null;
  suggestedWorkout: string | null;
  coachMessage: string | null;
  coachDirective: string | null;
  coachSignature: string | null;
}

export interface Workout {
  id: number;
  title: string;
  typeLabel: string | null;
  photoUrl: string | null;
  distance: string | null;
  pace: string | null;
  vertical: string | null;
  duration: string | null;
  occurredAt: string | null;
  kind: string | null;
}

export interface Mood {
  id: number;
  occurredAt: string;
  partOfDay: string;
  energy: number | null;
  mood: string | null;
  sleepQuality: number | null;
  soreness: number | null;
  stress: number | null;
  note: string | null;
}

export interface Weight {
  id: number;
  occurredAt: string;
  value: string;
  unit: string;
  delta: string | null;
  positive: boolean;
}

// The Timeline console's prop shape — what `loadTimeline()` resolves to and what
// the Rust `get_timeline` command serializes. `days` is the grouped, render-ready
// feed; the rest seed the console's filter/search state the way the web page read
// them from the URL.
export interface TimelineData {
  days: TimelineDay[];
  dateLabel: string;
  initialType?: string;
  initialQuery?: string;
}
