// Read-only Activity Timeline endpoint. The page reads via getTimeline()
// directly (server component), but this route exposes the same day-grouped
// payload for inspection and future client-side use. force-dynamic so it always
// reflects the current (per-scenario) database state without caching.

import { NextResponse } from 'next/server';
import { getTimeline } from '@/app/lib/timeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  const days = await getTimeline();
  return NextResponse.json({ days });
}
