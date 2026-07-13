// Trends data loader. Reads every TrendMetric (each is one chart for one
// range) and stitches its ordered TrendPoints on in JS — the models are flat
// (no FK relation), so this is a two-query load rather than an `include`. The
// Trends page loads all of them and the range switcher re-scopes client-side.
// Production starts empty → no metrics → the day-one "no history yet" state.

import { prisma } from '@/app/lib/prisma';
import type { TrendMetric, TrendPoint } from '@prisma/client';

export type TrendMetricWithPoints = TrendMetric & { points: TrendPoint[] };

export async function getTrends(): Promise<TrendMetricWithPoints[]> {
  const metrics = await prisma.trendMetric.findMany({
    orderBy: [{ range: 'asc' }, { order: 'asc' }],
  });
  if (metrics.length === 0) return [];

  const points = await prisma.trendPoint.findMany({
    where: { metricId: { in: metrics.map((m) => m.id) } },
    orderBy: { order: 'asc' },
  });

  const byMetric = new Map<number, TrendPoint[]>();
  for (const p of points) {
    const list = byMetric.get(p.metricId);
    if (list) list.push(p);
    else byMetric.set(p.metricId, [p]);
  }

  return metrics.map((m) => ({ ...m, points: byMetric.get(m.id) ?? [] }));
}
