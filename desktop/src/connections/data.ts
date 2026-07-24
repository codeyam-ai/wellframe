// Connections data source. The native Tauri app invokes the Rust connection
// commands (persisted to local SQLite); in a plain browser (codeyam preview /
// vite dev) the Tauri API is absent, so reads return an empty list and writes
// are local no-ops — the panel still opens and validates, nothing persists.
//
// The connect handshake is resolved by the shared, pure `resolveConnection`, so
// the write path here only validates (via that) and persists the result.

import {
  findProvider,
  resolveConnection,
  type ConnectMethod,
  type ConnectionRow,
} from './connections';

export interface ConnectResult {
  ok: boolean;
  error?: string;
}

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function loadConnections(): Promise<ConnectionRow[]> {
  if (!isTauri()) return [];
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<ConnectionRow[]>('list_connections');
  } catch {
    return [];
  }
}

export async function connectProvider(
  providerId: string,
  method: ConnectMethod,
  value = '',
): Promise<ConnectResult> {
  const provider = findProvider(providerId);
  if (!provider) return { ok: false, error: 'Unknown provider.' };

  // Pure validate + map method → status/detail (the deterministic handshake).
  const resolved = resolveConnection(providerId, method, value);
  if (!resolved.ok) return { ok: false, error: resolved.error };

  if (!isTauri()) return { ok: true }; // browser preview: no persistence
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('save_connection', {
      input: {
        providerId,
        kind: provider.kind,
        method,
        status: resolved.status,
        detail: resolved.detail,
        endpoint: resolved.endpoint,
      },
    });
    window.dispatchEvent(new Event('wf:data-changed'));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function disconnectProvider(providerId: string): Promise<ConnectResult> {
  if (!isTauri()) return { ok: true };
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('remove_connection', { providerId });
    window.dispatchEvent(new Event('wf:data-changed'));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function setActiveCoach(providerId: string): Promise<ConnectResult> {
  const provider = findProvider(providerId);
  if (!provider || provider.kind !== 'ai') {
    return { ok: false, error: 'Only an AI coach can be set active.' };
  }
  if (!isTauri()) return { ok: true };
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_active_coach', { providerId });
    window.dispatchEvent(new Event('wf:data-changed'));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
