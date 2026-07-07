// Read-only dashboard endpoint. The page reads via getDashboard() directly
// (server component), but this route exposes the same payload for inspection
// and future client-side use. force-dynamic so it always reflects the current
// (per-scenario) database state without caching.

import { NextResponse } from 'next/server';
import { getDashboard } from '@/app/lib/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getDashboard();
  return NextResponse.json(data);
}
