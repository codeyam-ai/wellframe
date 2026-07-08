import { getDashboard } from '@/app/lib/dashboard';
import { getConnectionRows } from '@/app/lib/connections.server';
import { AI_PROVIDERS, HEALTH_SOURCES, mergeCatalog } from '@/components/dashboard/connections';
import { DashboardConsole } from '@/components/dashboard/DashboardConsole';

// Always reflect the current (per-scenario) database state; the dashboard is a
// live briefing, never a cached one.
export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ coach?: string; setup?: string }>;
}) {
  const [{ briefing, vitals, workout }, connectionRows] = await Promise.all([
    getDashboard(),
    getConnectionRows(),
  ]);
  const { coach, setup } = await searchParams;
  const aiViews = mergeCatalog(AI_PROVIDERS, connectionRows);
  const healthViews = mergeCatalog(HEALTH_SOURCES, connectionRows);
  return (
    <DashboardConsole
      briefing={briefing}
      vitals={vitals}
      workout={workout}
      aiViews={aiViews}
      healthViews={healthViews}
      initialCoachOpen={coach === '1'}
      initialSetupOpen={setup === '1'}
    />
  );
}
