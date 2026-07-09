import { getTimeline } from '@/app/lib/timeline';
import { Timeline } from '@/components/timeline/Timeline';

// Always reflect the current (per-scenario) database state; the timeline is a
// live feed, never a cached one. Initial filter/search state is read from the
// URL so a scenario can capture a filtered view.
export const dynamic = 'force-dynamic';

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const [days, { type, q }] = await Promise.all([getTimeline(), searchParams]);
  const dateLabel = days.length > 0 ? days[0].dateLabel : 'Awaiting first sync';
  return (
    <Timeline
      days={days}
      dateLabel={dateLabel}
      initialType={type ?? 'all'}
      initialQuery={q ?? ''}
    />
  );
}
