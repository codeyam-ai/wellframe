// Recovery Center data source. In the native Tauri app this invokes the Rust
// `get_recovery` command (reads local SQLite); in a plain browser — the codeyam
// live preview / `vite dev` — the Tauri API is absent, so it falls back to a
// named fixture chosen by the `?s=<Scenario>` query param. One shape
// (RecoveryReadFull) serves both, so the ported UI is unaware of the source.

import type { RecoveryReadFull } from './models';
import { FIXTURES, type ScenarioName } from './fixtures';

async function fromNative(): Promise<RecoveryReadFull | null> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<RecoveryReadFull>('get_recovery');
  } catch {
    return null; // not running under Tauri
  }
}

function fromFixture(): RecoveryReadFull {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('s') as ScenarioName | null;
  if (requested && requested in FIXTURES) return FIXTURES[requested];
  return FIXTURES.Rich;
}

export interface RecoveryData {
  recovery: RecoveryReadFull;
  dateLabel: string;
}

export async function loadRecovery(): Promise<RecoveryData> {
  const native = await fromNative();
  const recovery = native ?? fromFixture();
  // The console takes recovery + dateLabel as separate props; derive the label
  // from the read (null on day-one → the awaiting-sync placeholder).
  return { recovery, dateLabel: recovery?.dateLabel ?? 'Awaiting first sync' };
}
