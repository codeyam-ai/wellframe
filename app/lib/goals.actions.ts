'use server';

// Server Action for the Goals surface — the create-a-goal write path (the
// page's primary interaction). Validation is delegated to the pure
// `validateGoalInput` so the form and the action agree; the action only
// persists the result and revalidates so the new goal shows on the next render.

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { validateGoalInput } from '@/components/goals/goals';

export interface CreateGoalInput {
  title: string;
  category: string;
  metric: string;
  target: number | string;
  current?: number | string;
  unit?: string;
  cadence?: string;
}

export interface CreateGoalResult {
  ok: boolean;
  error?: string;
}

export async function createGoal(
  input: CreateGoalInput,
): Promise<CreateGoalResult> {
  const validated = validateGoalInput(input);
  if (!validated.ok) return { ok: false, error: validated.error };
  const draft = validated.value;

  // New goals sort to the end of the list.
  const count = await prisma.goal.count();
  await prisma.goal.create({
    data: {
      order: count,
      title: draft.title,
      category: draft.category,
      metric: draft.metric,
      target: draft.target,
      current: draft.current,
      unit: draft.unit ?? null,
      cadence: draft.cadence ?? null,
      dueLabel: draft.cadence ?? null,
      createdAt: new Date().toISOString(),
    },
  });
  revalidatePath('/goals');
  return { ok: true };
}
