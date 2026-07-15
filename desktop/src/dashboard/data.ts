// Dashboard data source. In the native Tauri app this invokes the Rust
// `get_dashboard` command (reads local SQLite); in a plain browser — the
// codeyam live preview / `vite dev` — the Tauri API is absent, so it falls back
// to a named fixture chosen by the `?s=<Scenario>` query param. One shape
// (DashboardData) serves both, so the ported UI is unaware of the source.

import type { DashboardData } from './models';
import { FIXTURES, type ScenarioName } from './fixtures';

async function fromNative(): Promise<DashboardData | null> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<DashboardData>('get_dashboard');
  } catch {
    return null; // not running under Tauri
  }
}

function fromFixture(): DashboardData {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('s') as ScenarioName | null;
  if (requested && requested in FIXTURES) return FIXTURES[requested];
  return FIXTURES.Primed;
}

export async function loadDashboard(): Promise<DashboardData> {
  const native = await fromNative();
  return native ?? fromFixture();
}
