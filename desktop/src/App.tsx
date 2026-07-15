import { useEffect, useState, type ComponentType } from 'react';
import { loadDashboard } from './dashboard/data';
import DashboardConsole from './dashboard/DashboardConsole';
import { loadTimeline } from './timeline/data';
import Timeline from './timeline/Timeline';
import { loadTrends } from './trends/data';
import TrendsConsole from './trends/TrendsConsole';
import { loadRecovery } from './recovery/data';
import RecoveryConsole from './recovery/RecoveryConsole';
import { loadGoals } from './goals/data';
import GoalsConsole from './goals/GoalsConsole';
import { loadCheckin } from './checkin/data';
import CheckinConsole from './checkin/CheckinConsole';

// Minimal pathname router for the desktop app. Each console owns a route; the
// Metabar's nav anchors (/timeline, /trends, …) are intercepted for client-side
// navigation so switching consoles never reloads — the same behavior in the
// Tauri webview and in the browser preview. Scenario state stays in the `?s=`
// query param, read inside each console's data loader.

interface Route {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  load: () => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<any>;
}

const ROUTES: Record<string, Route> = {
  '/': { load: loadDashboard, Component: DashboardConsole },
  '/timeline': { load: loadTimeline, Component: Timeline },
  '/trends': { load: loadTrends, Component: TrendsConsole },
  '/recovery': { load: loadRecovery, Component: RecoveryConsole },
  '/goals': { load: loadGoals, Component: GoalsConsole },
  '/checkin': { load: loadCheckin, Component: CheckinConsole },
};

function currentPath(): string {
  return ROUTES[window.location.pathname] ? window.location.pathname : '/';
}

export default function App() {
  const [path, setPath] = useState(currentPath());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  // Load the active route's data whenever the route changes.
  useEffect(() => {
    let cancelled = false;
    setData(null);
    ROUTES[path].load().then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  // Client-side navigation: intercept internal anchor clicks + back/forward.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as HTMLElement).closest('a');
      const href = anchor?.getAttribute('href');
      if (!href || !href.startsWith('/')) return; // leave "#" / external links alone
      const url = new URL(href, window.location.origin);
      if (!ROUTES[url.pathname]) return;
      e.preventDefault();
      window.history.pushState({}, '', url.pathname + url.search);
      setPath(url.pathname);
    }
    function onPop() {
      setPath(currentPath());
    }
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  if (!data) return null;
  const { Component } = ROUTES[path];
  return <Component {...data} />;
}
