import { getRecovery } from '@/app/lib/recovery';
import { RecoveryConsole } from '@/components/recovery/RecoveryConsole';

// Always reflect the current (per-scenario) database state; the recovery read
// is live, never cached. Which factor / action row is expanded is read from the
// URL (?factor= / ?action=, 1-based) so the disclosure is deep-linkable and a
// scenario can capture it.
export const dynamic = 'force-dynamic';

export default async function RecoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ factor?: string; action?: string }>;
}) {
  const [recovery, params] = await Promise.all([getRecovery(), searchParams]);
  const dateLabel = recovery?.dateLabel ?? 'Awaiting first sync';
  const factorPos = params.factor ? Number(params.factor) : undefined;
  const actionPos = params.action ? Number(params.action) : undefined;
  return (
    <RecoveryConsole
      recovery={recovery}
      dateLabel={dateLabel}
      initialFactorPos={Number.isFinite(factorPos) ? factorPos : undefined}
      initialActionPos={Number.isFinite(actionPos) ? actionPos : undefined}
    />
  );
}
