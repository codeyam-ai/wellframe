// Dashboard data loader for the Wellframe "Daily Briefing Console".
//
// The console renders a single day's state: the most-recent DailyBriefing plus
// its overnight Vitals (ordered) and yesterday's Workout. Each scenario wipes +
// reseeds one coherent day, so reading "the latest / all rows" yields exactly
// that scenario's state. Production starts empty → briefing is null → the page
// shows the day-one onboarding empty state.

import { prisma } from '@/app/lib/prisma';
import type { DailyBriefing, Vital, Workout } from '@prisma/client';

export interface DashboardData {
  briefing: DailyBriefing | null;
  vitals: Vital[];
  workout: Workout | null;
}

export async function getDashboard(): Promise<DashboardData> {
  const [briefing, vitals, workout] = await Promise.all([
    prisma.dailyBriefing.findFirst({ orderBy: { date: 'desc' } }),
    prisma.vital.findMany({ orderBy: { order: 'asc' } }),
    prisma.workout.findFirst({ orderBy: { id: 'desc' } }),
  ]);
  return { briefing, vitals, workout };
}
