// Recovery Center data loader. Reads the single most-recent RecoveryRead, then
// stitches its ordered contributing factors and suggested actions on in JS —
// the models are flat (no FK relation), so this is separate queries rather than
// an `include`. Production starts empty → no read → the day-one empty state.

import { prisma } from '@/app/lib/prisma';
import type { RecoveryRead, RecoveryFactor, RecoveryAction } from '@prisma/client';

export type RecoveryReadFull =
  | (RecoveryRead & { factors: RecoveryFactor[]; actions: RecoveryAction[] })
  | null;

export async function getRecovery(): Promise<RecoveryReadFull> {
  const read = await prisma.recoveryRead.findFirst({ orderBy: { date: 'desc' } });
  if (!read) return null;

  const [factors, actions] = await Promise.all([
    prisma.recoveryFactor.findMany({
      where: { recoveryId: read.id },
      orderBy: { order: 'asc' },
    }),
    prisma.recoveryAction.findMany({
      where: { recoveryId: read.id },
      orderBy: { order: 'asc' },
    }),
  ]);

  return { ...read, factors, actions };
}
