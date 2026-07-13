import { getCheckins } from '@/app/lib/checkin';
import { CheckinConsole } from '@/components/checkin/CheckinConsole';
import { inferPartOfDay, PARTS_OF_DAY, type PartOfDay } from '@/components/checkin/checkin';

// Always reflect the current (per-scenario) database state; a new check-in must
// show in the history immediately after submit. The initial part of day is read
// from the URL (?part=morning|evening) so the state is deep-linkable and a
// scenario can capture it; absent the param it defaults to the current time.
export const dynamic = 'force-dynamic';

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ part?: string }>;
}) {
  const [checkins, params] = await Promise.all([getCheckins(), searchParams]);
  const dateLabel = checkins.length > 0 ? 'Logging' : 'Awaiting first check-in';
  const defaultPartOfDay: PartOfDay = (PARTS_OF_DAY as readonly string[]).includes(
    params.part ?? '',
  )
    ? (params.part as PartOfDay)
    : inferPartOfDay(new Date().getHours());
  return (
    <CheckinConsole
      checkins={checkins}
      dateLabel={dateLabel}
      defaultPartOfDay={defaultPartOfDay}
    />
  );
}
