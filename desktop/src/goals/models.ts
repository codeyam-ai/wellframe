// Local data types for the desktop Goals console. These mirror the web app's
// Prisma `Goal` model but carry no Prisma/server coupling — the native app gets
// these from a Rust `get_goals` command, and the browser preview gets them from
// fixtures. Field names match the Rust command's camelCase serialization so one
// shape serves both sources.

export interface Goal {
  id: number;
  order: number;
  title: string;
  category: string;
  metric: string;
  target: number;
  current: number;
  unit: string | null;
  cadence: string | null;
  dueLabel: string | null;
  note: string | null;
  createdAt: string;
}

export interface GoalsData {
  goals: Goal[];
  dateLabel: string;
  // Open the composer on first render (a scenario that captures the
  // composer-open state). Optional; defaults to closed.
  initialComposing?: boolean;
}
