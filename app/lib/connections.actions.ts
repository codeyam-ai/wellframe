'use server';

// Server Actions for provider connections — the app's write path. Each action
// runs a deterministic, MOCKED handshake (no real network in this preview),
// persists the result to the ProviderConnection table, and revalidates the
// dashboard so the change shows on the next render.

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  findProvider,
  resolveConnection,
  type ConnectMethod,
} from '@/components/dashboard/connections';

export interface ConnectResult {
  ok: boolean;
  error?: string;
}

export async function connectProvider(
  providerId: string,
  method: ConnectMethod,
  value: string = '',
): Promise<ConnectResult> {
  const provider = findProvider(providerId);
  if (!provider) return { ok: false, error: 'Unknown provider.' };

  // resolveConnection (pure) validates + maps method → status/detail; the action
  // only persists the result and revalidates.
  const result = resolveConnection(providerId, method, value);
  if (!result.ok) return { ok: false, error: result.error };

  const now = new Date().toISOString();
  await prisma.providerConnection.upsert({
    where: { providerId },
    create: {
      providerId,
      kind: provider.kind,
      method,
      status: result.status,
      detail: result.detail,
      endpoint: result.endpoint,
      isActiveCoach: false,
      connectedAt: now,
    },
    update: {
      method,
      status: result.status,
      detail: result.detail,
      endpoint: result.endpoint,
    },
  });
  revalidatePath('/');
  return { ok: true };
}

export async function disconnectProvider(providerId: string): Promise<ConnectResult> {
  await prisma.providerConnection.deleteMany({ where: { providerId } });
  revalidatePath('/');
  return { ok: true };
}

export async function setActiveCoach(providerId: string): Promise<ConnectResult> {
  const provider = findProvider(providerId);
  if (!provider || provider.kind !== 'ai') {
    return { ok: false, error: 'Only an AI coach can be set active.' };
  }
  // Exactly one AI connection is active at a time.
  await prisma.$transaction([
    prisma.providerConnection.updateMany({
      where: { kind: 'ai', isActiveCoach: true },
      data: { isActiveCoach: false },
    }),
    prisma.providerConnection.updateMany({
      where: { providerId, status: { not: 'error' } },
      data: { isActiveCoach: true },
    }),
  ]);
  revalidatePath('/');
  return { ok: true };
}
