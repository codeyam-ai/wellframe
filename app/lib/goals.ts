// Goals data loader. Reads every goal in display order. Production starts empty
// → no goals → the page shows the day-one "set your first goal" empty state.

import { prisma } from '@/app/lib/prisma';
import type { Goal } from '@prisma/client';

export async function getGoals(): Promise<Goal[]> {
  return prisma.goal.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] });
}
