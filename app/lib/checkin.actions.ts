'use server';

// Server Action for the Daily Check-in surface — the submit-a-check-in write
// path (the page's primary interaction). Writes a Mood row (the same model the
// Activity Timeline reads) and revalidates both surfaces so the new entry shows
// on the check-in list and the timeline. Validation is delegated to the pure
// `validateCheckinInput` so the form and the action agree.

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { validateCheckinInput } from '@/components/checkin/checkin';

export interface SubmitCheckinInput {
  partOfDay: string;
  occurredAt?: string;
  energy?: number | string | null;
  mood?: string | null;
  sleepQuality?: number | string | null;
  soreness?: number | string | null;
  stress?: number | string | null;
  note?: string | null;
}

export interface SubmitCheckinResult {
  ok: boolean;
  error?: string;
}

export async function submitCheckin(
  input: SubmitCheckinInput,
): Promise<SubmitCheckinResult> {
  // Default the timestamp to now when the client didn't supply one.
  const occurredAt = input.occurredAt || new Date().toISOString();
  const validated = validateCheckinInput({ ...input, occurredAt });
  if (!validated.ok) return { ok: false, error: validated.error };
  const d = validated.value;

  await prisma.mood.create({
    data: {
      occurredAt: d.occurredAt,
      partOfDay: d.partOfDay,
      energy: d.energy,
      mood: d.mood,
      sleepQuality: d.sleepQuality,
      soreness: d.soreness,
      stress: d.stress,
      note: d.note,
    },
  });
  revalidatePath('/checkin');
  revalidatePath('/timeline');
  return { ok: true };
}
