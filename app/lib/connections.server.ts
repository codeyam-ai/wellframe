// Server-only read for provider connections. Imports prisma, so it must never
// be pulled into a client bundle — the Connections panel receives the mapped
// ConnectionRow[] as props from the server component. The per-row narrowing
// lives in the pure, unit-tested `toConnectionRow` helper.

import { prisma } from '@/app/lib/prisma';
import { toConnectionRow, type ConnectionRow } from '@/components/dashboard/connections';

export async function getConnectionRows(): Promise<ConnectionRow[]> {
  const rows = await prisma.providerConnection.findMany({ orderBy: { id: 'asc' } });
  return rows.map(toConnectionRow);
}
