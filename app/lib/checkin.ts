// Daily Check-in data loader. Reads recent Mood rows (most recent first) so the
// surface can show today's check-ins and the trailing history. Production
// starts empty → no check-ins → the page shows the day-one state and an open
// form.

import { prisma } from '@/app/lib/prisma';
import type { Mood } from '@prisma/client';

export async function getCheckins(limit = 30): Promise<Mood[]> {
  return prisma.mood.findMany({ orderBy: { occurredAt: 'desc' }, take: limit });
}
