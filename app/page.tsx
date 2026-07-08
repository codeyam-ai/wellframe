import { getDashboard } from '@/app/lib/dashboard';
import { DashboardConsole } from '@/components/dashboard/DashboardConsole';

// Always reflect the current (per-scenario) database state; the dashboard is a
// live briefing, never a cached one.
export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ coach?: string; setup?: string }>;
}) {
  const { briefing, vitals, workout } = await getDashboard();
  const { coach, setup } = await searchParams;
  return (
    <DashboardConsole
      briefing={briefing}
      vitals={vitals}
      workout={workout}
      initialCoachOpen={coach === '1'}
      initialSetupOpen={setup === '1'}
    />
  );
}
