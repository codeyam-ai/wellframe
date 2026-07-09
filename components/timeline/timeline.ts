// Pure, client-safe helpers for the Activity Timeline. No Prisma imports — the
// server loader (app/lib/timeline.ts) maps DB rows into the `TimelineEntry`
// view-model, and these helpers do the grouping, relative-day labeling,
// filtering, and one-line summaries. Co-located unit tests in timeline.test.ts.

import type { DailyBriefing, Mood, Weight, Workout } from '@prisma/client';

export type EntryKind = 'workout' | 'briefing' | 'mood' | 'weight';

// A single loaded entry's raw row, tagged by kind, for the detail view. The
// server loader (app/lib/timeline.ts) produces this; EntryDetail renders it.
export type DetailData =
  | { kind: 'workout'; row: Workout }
  | { kind: 'mood'; row: Mood }
  | { kind: 'weight'; row: Weight }
  | { kind: 'briefing'; row: DailyBriefing };

// A normalized, render-ready timeline row. `id` is a composite `${kind}-${dbId}`
// so it doubles as the stable URL key for the detail route.
export interface TimelineEntry {
  id: string;
  kind: EntryKind;
  dbId: number;
  occurredAt: string; // ISO
  title: string;
  summary: string; // one-line stat/summary
  accent?: string; // chip / caption label, e.g. "Z2", "Morning"
  photoUrl?: string;
  filterKey: string; // which chip this entry belongs to: kind, or workout's kind
}

export interface TimelineDay {
  key: string; // "2026-07-06"
  dateLabel: string; // "Today" | "Yesterday" | "Mon Jul 6"
  entries: TimelineEntry[];
}

// The chips shown in the filter row. `filterKey` matches TimelineEntry.filterKey.
export interface FilterChip {
  filterKey: string;
  label: string;
}

// Human labels + display order for the known filter keys. Workout kinds come
// first (most common), then the other entry types.
export const CHIP_LABELS: Record<string, string> = {
  run: 'Runs',
  ride: 'Rides',
  strength: 'Strength',
  walk: 'Walks',
  yoga: 'Yoga',
  workout: 'Workouts',
  briefing: 'Briefings',
  mood: 'Mood',
  weight: 'Weight',
};
export const CHIP_ORDER = [
  'run', 'ride', 'strength', 'walk', 'yoga', 'workout', 'briefing', 'mood', 'weight',
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Calendar-date key of an ISO datetime, e.g. "2026-07-06T07:14:00Z" -> "2026-07-06".
// Uses the UTC date so grouping is deterministic and independent of the render
// machine's timezone (scenarios must screenshot identically anywhere).
export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

// Whole days between two date keys (a - b), computed from the UTC calendar date.
function daysBetween(aKey: string, bKey: string): number {
  const a = Date.parse(`${aKey}T00:00:00Z`);
  const b = Date.parse(`${bKey}T00:00:00Z`);
  return Math.round((a - b) / 86_400_000);
}

// Human day label relative to the newest entry's day (the timeline's "now"),
// never relative to the wall clock — so a seeded scenario always renders the
// same labels. The newest day is "Today", the one before "Yesterday", and
// anything older is "Wed Jul 2".
export function relativeDayLabel(iso: string, newestIso: string): string {
  const key = dayKey(iso);
  const diff = daysBetween(dayKey(newestIso), key);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  const t = Date.parse(`${key}T00:00:00Z`);
  const d = new Date(t);
  return `${WEEKDAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

// Short mono time stamp, e.g. "07:14".
export function timeLabel(iso: string): string {
  return iso.slice(11, 16);
}

// Group already-normalized entries (any order) into newest-first days, each
// day's entries also newest-first. The relative labels key off the single
// newest entry across the whole set.
export function groupByDay(entries: TimelineEntry[]): TimelineDay[] {
  if (entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const newestIso = sorted[0].occurredAt;
  const byKey = new Map<string, TimelineEntry[]>();
  for (const e of sorted) {
    const k = dayKey(e.occurredAt);
    const bucket = byKey.get(k);
    if (bucket) bucket.push(e);
    else byKey.set(k, [e]);
  }
  return [...byKey.entries()].map(([key, dayEntries]) => ({
    key,
    dateLabel: relativeDayLabel(dayEntries[0].occurredAt, newestIso),
    entries: dayEntries,
  }));
}

// Does an entry pass the active type chip + search box? An empty `type` (or
// "all") matches every kind; the query matches case-insensitively across the
// title, summary, and accent.
export function entryMatchesFilter(
  entry: TimelineEntry,
  filter: { type?: string; q?: string },
): boolean {
  const type = (filter.type ?? '').toLowerCase();
  if (type && type !== 'all' && entry.filterKey.toLowerCase() !== type) {
    return false;
  }
  const q = (filter.q ?? '').trim().toLowerCase();
  if (!q) return true;
  const haystack = `${entry.title} ${entry.summary} ${entry.accent ?? ''}`.toLowerCase();
  return haystack.includes(q);
}

// Parse a composite entry id ("workout-3") back into its kind + numeric id for
// the detail route. Returns null on a malformed id.
export function parseEntryId(id: string): { kind: EntryKind; dbId: number } | null {
  const dash = id.lastIndexOf('-');
  if (dash <= 0) return null;
  const kind = id.slice(0, dash) as EntryKind;
  const dbId = Number(id.slice(dash + 1));
  if (!Number.isInteger(dbId) || dbId <= 0) return null;
  if (!['workout', 'briefing', 'mood', 'weight'].includes(kind)) return null;
  return { kind, dbId };
}

// ── one-line summary builders ───────────────────────────────────────────────

// Join the present workout stats with a middle dot, e.g. "8.2 mi · 8:42 · 1,240 ft".
export function workoutSummary(w: Pick<Workout, 'distance' | 'pace' | 'vertical' | 'duration'>): string {
  return [w.distance, w.pace, w.vertical, w.duration].filter(Boolean).join(' · ');
}

// e.g. "Energy 4 · Steady · Slept well". Only present fields appear.
export function moodSummary(
  m: Pick<Mood, 'energy' | 'mood' | 'note'>,
): string {
  const parts: string[] = [];
  if (m.energy != null) parts.push(`Energy ${m.energy}`);
  if (m.mood) parts.push(m.mood);
  if (m.note) parts.push(m.note);
  return parts.join(' · ');
}

// e.g. "154.2 lb · ▼0.4". Delta is appended only when present.
export function weightSummary(w: Pick<Weight, 'value' | 'unit' | 'delta'>): string {
  const base = `${w.value} ${w.unit}`;
  return w.delta ? `${base} · ${w.delta}` : base;
}

// A briefing's timeline timestamp is its ISO `date`; when only a bare date is
// stored, place it at 07:00 so it sorts among the morning entries.
export function briefingOccurredAt(date: string): string {
  return date.length > 10 ? date : `${date}T07:00:00Z`;
}

// Normalize the four raw source arrays into TimelineEntry rows and group them
// into newest-first days. Pure — the server loader (app/lib/timeline.ts) reads
// the rows via Prisma and delegates all shaping here. A workout with no
// occurredAt is skipped (it exists only for the dashboard's latest-by-id read).
export function buildTimeline(sources: {
  workouts: Workout[];
  briefings: DailyBriefing[];
  moods: Mood[];
  weights: Weight[];
}): TimelineDay[] {
  const entries: TimelineEntry[] = [];

  for (const w of sources.workouts) {
    if (!w.occurredAt) continue;
    entries.push({
      id: `workout-${w.id}`,
      kind: 'workout',
      dbId: w.id,
      occurredAt: w.occurredAt,
      title: w.title,
      summary: workoutSummary(w),
      accent: w.typeLabel ?? (w.kind ? w.kind[0].toUpperCase() + w.kind.slice(1) : undefined),
      photoUrl: w.photoUrl ?? undefined,
      filterKey: w.kind ?? 'workout',
    });
  }

  for (const b of sources.briefings) {
    entries.push({
      id: `briefing-${b.id}`,
      kind: 'briefing',
      dbId: b.id,
      occurredAt: briefingOccurredAt(b.date),
      title: b.headline ?? 'Daily briefing',
      summary: [b.readinessLabel, b.statusLine].filter(Boolean).join(' · '),
      accent: b.readinessScore != null ? `Readiness ${b.readinessScore}` : 'Briefing',
      filterKey: 'briefing',
    });
  }

  for (const m of sources.moods) {
    const part = m.partOfDay === 'evening' ? 'Evening' : 'Morning';
    entries.push({
      id: `mood-${m.id}`,
      kind: 'mood',
      dbId: m.id,
      occurredAt: m.occurredAt,
      title: `${part} check-in`,
      summary: moodSummary(m),
      accent: part,
      filterKey: 'mood',
    });
  }

  for (const w of sources.weights) {
    entries.push({
      id: `weight-${w.id}`,
      kind: 'weight',
      dbId: w.id,
      occurredAt: w.occurredAt,
      title: 'Body weight',
      summary: weightSummary(w),
      accent: 'Weight',
      filterKey: 'weight',
    });
  }

  return groupByDay(entries);
}

// Build the filter chip set from the entry kinds actually present in the data.
// Always leads with an "All" chip; known kinds appear in CHIP_ORDER order, and
// any unexpected filterKey still gets a chip so nothing in the feed is
// unreachable by the filters.
export function deriveChips(days: TimelineDay[]): FilterChip[] {
  const present = new Set<string>();
  for (const day of days) for (const e of day.entries) present.add(e.filterKey);
  const known = CHIP_ORDER.filter((k) => present.has(k)).map((k) => ({
    filterKey: k,
    label: CHIP_LABELS[k] ?? k,
  }));
  const extra = [...present]
    .filter((k) => !CHIP_ORDER.includes(k))
    .map((k) => ({ filterKey: k, label: CHIP_LABELS[k] ?? k }));
  return [{ filterKey: 'all', label: 'All' }, ...known, ...extra];
}
