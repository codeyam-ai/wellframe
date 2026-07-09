---
title: "Activity Timeline"
mode: ui
createdAt: "2026-07-08"
source: feature-request
---

# Activity Timeline

A chronological, **day-grouped** feed of everything the user has been doing —
runs, rides, strength and other **workouts**, **daily briefings**, **mood
check-ins**, and **body-weight** readings — with **type-filter chips + text
search** at the top and a dedicated **detail view** when an entry is selected.
It answers "what have I been doing?" the way the dashboard answers "how am I
doing today?".

Visual language: the same deep-ink **Plinth** system already scoped under `.wf`
in `app/globals.css` (mono section numbers, serif headlines, signal-blue +
mint accents, thin rules, grayscale photo plates). This is a new surface in the
same design world as the Briefing Console — it must read as the same product.

## Scope boundary (read this first)

This is the codeyam Next.js / Prisma / SQLite **web preview**, not the Tauri
desktop app, and the production DB starts empty. Each scenario wipes + reseeds
its own coherent slice of history; production day-one shows the empty state.
No external network calls — all data is local DB rows. Per-scenario state lives
in the DB and is read on every request (`force-dynamic`), and the initial
filter/search state is read from the URL (`?type=`, `?q=`) so a scenario can
capture a filtered view.

## New / changed data model (Prisma, SQLite)

The timeline is polymorphic over four sources. `DailyBriefing` already exists.
`Workout` exists but has **no date** — a chronological feed needs one, so we add
`occurredAt`. Two new models are added.

- **`Workout`** — add `occurredAt String` (ISO datetime, e.g. `"2026-07-06T07:14:00Z"`)
  and an optional `duration String?` (e.g. `"1:12:40"`). Existing fields
  (`title`, `typeLabel`, `photoUrl`, `distance`, `pace`, `vertical`) stay. Add an
  optional `kind String?` (e.g. `"run" | "ride" | "strength" | "walk" | "yoga"`)
  to drive the type chips and the caption accent. **Note:** the dashboard's
  `getDashboard()` reads the latest workout by `id`; adding nullable/defaulted
  columns is backward-compatible and does not change that read.
- **`Mood`** (new) — a daily check-in: `id`, `occurredAt String`, `partOfDay
  String` ("morning" | "evening"), `energy Int?` (1–5), `mood String?`
  (e.g. "Steady"), `sleepQuality Int?`, `soreness Int?`, `stress Int?`,
  `note String?`.
- **`Weight`** (new) — a body-weight reading: `id`, `occurredAt String`,
  `value String` (e.g. `"154.2"`), `unit String` (default `"lb"`),
  `delta String?` (trend chip, e.g. `"▼0.4"`), `positive Boolean` (mint vs
  signal track).

## Data loader — `app/lib/timeline.ts` (server)

Mirrors `app/lib/dashboard.ts`. Reads all four tables, normalizes each row into a
common **`TimelineEntry`** view-model, sorts newest-first, and groups into days.

```
type EntryKind = 'workout' | 'briefing' | 'mood' | 'weight';
interface TimelineEntry {
  id: string;          // composite: `${kind}-${dbId}` (stable URL key)
  kind: EntryKind;
  occurredAt: string;  // ISO
  title: string;       // "Ridgeline Trail Run" | "Morning check-in" | ...
  summary: string;     // one-line: "8.2 mi · 8:42 · 1,240 ft" | "Energy 4 · Steady"
  accent?: string;     // chip/caption label, e.g. "Z2", "run"
  photoUrl?: string;
}
interface TimelineDay { dateLabel: string; entries: TimelineEntry[]; }
export async function getTimeline(): Promise<TimelineDay[]>
```

Grouping key = calendar date of `occurredAt`; `dateLabel` renders "Today" /
"Yesterday" / "Mon Jul 6" relative to the newest entry's date (deterministic —
derived from the data, never `Date.now()`, so scenarios are stable).

## Pure helpers (co-located unit tests, like `format.ts` / `dial.ts`)

In `components/timeline/timeline.ts` (client-safe, no Prisma):

- `dayKey(iso)` → `"2026-07-06"` and `relativeDayLabel(iso, newestIso)` →
  `"Today" | "Yesterday" | "Mon Jul 6"`.
- `entryMatchesFilter(entry, { type, q })` → boolean — drives both the chips and
  the search box (case-insensitive match over title + summary + accent).
- `workoutSummary` / `moodSummary` / `weightSummary` — the one-line summary
  builders (unit-tested against representative rows).
- `parseEntryId(id)` → `{ kind, dbId }` for the detail route.

Co-located `timeline.test.ts` covers grouping, relative labels, filter matching,
and each summary builder.

## Components (`components/timeline/`)

- **`Timeline`** (client) — owns filter + search state (seeded from
  `?type=`/`?q=`), renders `TimelineFilters` + the list of `TimelineDay`s, shows
  the empty state when nothing matches / nothing exists.
- **`TimelineFilters`** — the chip row (All · Runs · Rides · Strength · Briefings
  · Mood · Weight) + a mono search input, Plinth-styled.
- **`TimelineDay`** — a `.wf-secnum`-style date header + its entries.
- **`TimelineEntry`** — one row, rendered by `kind` (workout gets a grayscale
  photo plate + stats à la `FieldLog`; briefing/mood/weight get compact
  instrument rows). Whole row links to the detail view.
- **`EntryDetail`** — the detail surface: full stats for a workout (distance /
  pace / vertical / duration + photo), or the check-in / weight / briefing
  breakdown, plus a "back to timeline" affordance.
- **`Metabar`** (reuse, extended) — add an optional `subject` prop (center label,
  "Activity · Timeline") and make the WELLFRAME brand link to `/`. Dashboard
  keeps its current "Daily Briefing · Console" subject.

## Routes

- **`app/timeline/page.tsx`** (url `/timeline`) — server component,
  `force-dynamic`; `getTimeline()` → `<Timeline>`; reads `?type=` / `?q=` for
  initial filter state.
- **`app/timeline/[entryId]/page.tsx`** (url `/timeline/workout-1`) — server
  component; `parseEntryId` → loads the one row → `<EntryDetail>`; `notFound()`
  on a missing/unknown entry.
- A link from the dashboard to the timeline (and the brand-home link back) so the
  two surfaces are reachable — the app currently has no cross-page nav.

## Scenarios (each carries its own seed; production stays empty)

**Application scenarios (`/timeline`):**

1. **Timeline — Day One Empty** — all tables empty → the calm empty state
   ("Your timeline is quiet — activity will appear here as it syncs").
2. **Timeline — Sparse** — a single day: one workout + one morning mood.
3. **Timeline — Rich Week** — ~5 days spanning all four entry types; exercises
   day grouping, chips, and the "field log" photo rows.
4. **Timeline — Filtered to Runs** — the rich set with `?type=run` → only run
   workouts show (captures the active-filter state).
5. **Timeline — Search "trail"** — the rich set with `?q=trail` → search results.
6. **Timeline — Edge Cases** — very long workout title (wrapping), a workout
   missing optional fields (no distance/pace/photo), and a day with only a mood
   entry.

**Detail scenario (`/timeline/workout-<id>`):**

7. **Entry Detail — Workout** — a single rich workout detail view.

**Isolated-component scenarios** (hardcoded props, `/isolated-components/...`):
`Timeline` (Rich / Empty / Filtered), `TimelineFilters` (Default / ActiveChip /
Searching), `TimelineDay` (Default), `TimelineEntry` (Workout / Briefing / Mood /
Weight / LongTitle / Minimal), `EntryDetail` (Workout / Mood).

## Out of scope (future passes)

Photos/voice on entries, editing/deleting from the timeline, infinite scroll /
pagination, date-range picker, journal entries and meals as entry types (only the
four chosen types ship now).
