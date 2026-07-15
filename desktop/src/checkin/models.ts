// Local data types for the desktop Daily Check-in. These mirror the web app's
// Prisma `Mood` model but carry no Prisma/server coupling — the native app gets
// these from a Rust `get_checkin` command, and the browser preview gets them
// from fixtures. Field names match the Rust command's camelCase serialization
// so one shape serves both sources.

import type { PartOfDay } from './checkin';

// One self-reported check-in (Prisma `Mood`). Ratings are 1-5 or null when not
// rated; mood and note are optional free text. `partOfDay` is "morning" |
// "evening" (kept a plain string to match the serialized row).
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

// The full payload the Check-in console renders: the recent-check-in history
// (most recent first), the metabar date label, and the initially-selected part
// of day. One shape (CheckinData) serves both the native command and fixtures.
export interface CheckinData {
  checkins: Mood[];
  dateLabel: string;
  defaultPartOfDay: PartOfDay;
}
