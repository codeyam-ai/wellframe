import { useEffect, useState } from 'react';
import type { DashboardData } from './dashboard/models';
import { loadDashboard } from './dashboard/data';
import { DashboardConsole } from './dashboard/DashboardConsole';

// Renders the ported Daily Briefing Console. Data comes from the native Rust
// `get_dashboard` command under Tauri, or a `?s=<Scenario>` fixture in the
// browser preview — see dashboard/data.ts.

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDashboard().then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;
  return <DashboardConsole {...data} />;
}
