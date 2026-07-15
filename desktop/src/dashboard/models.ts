// Local data types for the desktop Dashboard. These mirror the web app's Prisma
// models (DailyBriefing / Vital / Workout) but carry no Prisma/server coupling —
// the native app gets these from a Rust `get_dashboard` command, and the browser
// preview gets them from fixtures. Field names match the Rust command's
// camelCase serialization so one shape serves both sources.

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

export interface Vital {
  id: number;
  order: number;
  label: string;
  value: string;
  unit: string | null;
  delta: string | null;
  trackPct: number;
  positive: boolean;
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

export interface DashboardData {
  briefing: DailyBriefing | null;
  vitals: Vital[];
  workout: Workout | null;
}
