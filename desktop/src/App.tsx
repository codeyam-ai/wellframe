import { useEffect, useState } from 'react';

// Placeholder shell screen. It exercises the frontend↔Rust bridge: when running
// inside Tauri it invokes the `app_info` command and shows the native runtime
// details; in a plain browser (codeyam preview / `vite dev`) the Tauri API is
// absent, so it degrades to a "running in browser preview" state. The real
// Dashboard port replaces this screen in the next cycle.

interface AppInfo {
  name: string;
  version: string;
  tauri_version: string;
  os: string;
}

export default function App() {
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [runtime, setRuntime] = useState<'tauri' | 'browser' | 'loading'>('loading');

  useEffect(() => {
    let cancelled = false;
    async function probe() {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const result = await invoke<AppInfo>('app_info');
        if (!cancelled) {
          setInfo(result);
          setRuntime('tauri');
        }
      } catch {
        if (!cancelled) setRuntime('browser');
      }
    }
    probe();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="shell">
      <div className="mark">WF</div>
      <h1>Wellframe</h1>
      <p className="tagline">Native desktop shell · Tauri + React + Vite</p>

      <div className="status" data-runtime={runtime}>
        {runtime === 'loading' && <span>Checking runtime…</span>}
        {runtime === 'browser' && <span>Running in browser preview (no native shell)</span>}
        {runtime === 'tauri' && info && (
          <span>
            Native shell live · Tauri {info.tauri_version} · {info.os}
          </span>
        )}
      </div>

      <ul className="roadmap">
        <li className="done">Shell skeleton — this window</li>
        <li>Dashboard port + local SQLite (Rust commands)</li>
        <li>Timeline · Trends · Recovery · Goals · Check-in</li>
        <li>AI coach provider layer</li>
        <li>MCP server → .mcpb bundle</li>
        <li>Signing / notarization + installers</li>
      </ul>
    </main>
  );
}
