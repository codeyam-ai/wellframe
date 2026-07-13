import { getTrends } from '@/app/lib/trends';
import { TrendsConsole } from '@/components/trends/TrendsConsole';

// Always reflect the current (per-scenario) database state; trends are a live
// read of history, never cached. The initial range is read from the URL so a
// scenario can capture a specific range view.
export const dynamic = 'force-dynamic';

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const [metrics, { range }] = await Promise.all([getTrends(), searchParams]);
  // Latest data stamp for the metabar; fall back to the day-one message.
  const dateLabel = metrics.length > 0 ? 'Trailing history' : 'Awaiting first sync';
  return (
    <TrendsConsole
      metrics={metrics}
      dateLabel={dateLabel}
      initialRange={range ?? 'weekly'}
    />
  );
}
