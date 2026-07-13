import { getGoals } from '@/app/lib/goals';
import { GoalsConsole } from '@/components/goals/GoalsConsole';

// Always reflect the current (per-scenario) database state; goals are a live
// read and a new goal must show immediately after the create action. The
// composer-open state is read from the URL (?new=1) so it's deep-linkable and a
// scenario can capture it.
export const dynamic = 'force-dynamic';

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [goals, params] = await Promise.all([getGoals(), searchParams]);
  const dateLabel = goals.length > 0 ? 'Tracking' : 'Awaiting first goal';
  return (
    <GoalsConsole
      goals={goals}
      dateLabel={dateLabel}
      initialComposing={params.new === '1'}
    />
  );
}
