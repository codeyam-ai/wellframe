// Activity Timeline data loader. Mirrors app/lib/dashboard.ts: reads the four
// timeline sources (Workout, DailyBriefing, Mood, Weight) via Prisma, normalizes
// each row into the shared TimelineEntry view-model, and groups them into
// newest-first days. Each scenario seeds its own coherent slice of history;
// production starts empty → getTimeline() returns [] → the page shows the
// day-one empty state.

import { prisma } from '@/app/lib/prisma';
import {
  briefingOccurredAt,
  buildTimeline,
  parseEntryId,
  type DetailData,
  type TimelineDay,
} from '@/components/timeline/timeline';

// Thin boundary read: fetch the four timeline sources and hand them to the
// pure `buildTimeline` (which does all normalization + grouping — unit-tested
// in components/timeline/timeline.test.ts). Empty DB → [] → day-one state.
export async function getTimeline(): Promise<TimelineDay[]> {
  const [workouts, briefings, moods, weights] = await Promise.all([
    prisma.workout.findMany(),
    prisma.dailyBriefing.findMany(),
    prisma.mood.findMany(),
    prisma.weight.findMany(),
  ]);
  return buildTimeline({ workouts, briefings, moods, weights });
}

// Load the single row named by a composite entry id ("workout-3") for the
// detail view, tagged by kind, plus its ISO timestamp. Returns null on a
// malformed id, an unknown kind, a missing row, or a workout with no
// occurredAt (which cannot appear on the timeline in the first place).
export async function getTimelineEntry(
  entryId: string,
): Promise<{ data: DetailData; occurredAt: string } | null> {
  const parsed = parseEntryId(entryId);
  if (!parsed) return null;
  const { kind, dbId } = parsed;

  if (kind === 'workout') {
    const row = await prisma.workout.findUnique({ where: { id: dbId } });
    return row && row.occurredAt ? { data: { kind, row }, occurredAt: row.occurredAt } : null;
  }
  if (kind === 'mood') {
    const row = await prisma.mood.findUnique({ where: { id: dbId } });
    return row ? { data: { kind, row }, occurredAt: row.occurredAt } : null;
  }
  if (kind === 'weight') {
    const row = await prisma.weight.findUnique({ where: { id: dbId } });
    return row ? { data: { kind, row }, occurredAt: row.occurredAt } : null;
  }
  // briefing
  const row = await prisma.dailyBriefing.findUnique({ where: { id: dbId } });
  return row ? { data: { kind: 'briefing', row }, occurredAt: briefingOccurredAt(row.date) } : null;
}
