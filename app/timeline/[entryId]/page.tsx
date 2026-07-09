import { notFound } from 'next/navigation';
import { getTimelineEntry } from '@/app/lib/timeline';
import { timeLabel } from '@/components/timeline/timeline';
import { EntryDetail } from '@/components/timeline/EntryDetail';

export const dynamic = 'force-dynamic';

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;
  const detail = await getTimelineEntry(entryId);
  if (!detail) notFound();
  return <EntryDetail data={detail.data} timeStamp={timeLabel(detail.occurredAt)} />;
}
