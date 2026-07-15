// Local data types for the desktop Recovery Center. These mirror the web app's
// Prisma models (RecoveryRead / RecoveryFactor / RecoveryAction) but carry no
// Prisma/server coupling — the native app gets these from a Rust `get_recovery`
// command, and the browser preview gets them from fixtures. Field names match
// the Rust command's camelCase serialization so one shape serves both sources.

export interface RecoveryRead {
  id: number;
  date: string;
  dateLabel: string;
  score: number | null;
  label: string | null;
  headline: string | null;
  statusLine: string | null;
  summary: string | null;
}

export interface RecoveryFactor {
  id: number;
  recoveryId: number;
  order: number;
  label: string;
  value: string;
  state: string;
  trackPct: number;
  positive: boolean;
  detail: string | null;
}

export interface RecoveryAction {
  id: number;
  recoveryId: number;
  order: number;
  title: string;
  kind: string;
  durationLabel: string | null;
  detail: string | null;
}

// The single most-recent read with its ordered factors and actions stitched on.
// `null` = no read yet → the day-one empty state.
export type RecoveryReadFull =
  | (RecoveryRead & { factors: RecoveryFactor[]; actions: RecoveryAction[] })
  | null;
