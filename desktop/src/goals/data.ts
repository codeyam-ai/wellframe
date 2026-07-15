// Goals data source. The native Tauri app invokes `get_goals`, which returns the
// goal rows in display order; this layer derives the metabar label and reads the
// composer-open deep link. In the browser preview (no Tauri) it falls back to a
// `?s=` fixture. Production starts empty → no goals → the day-one empty state.

import type { GoalsData, Goal } from './models';
import { FIXTURES, type ScenarioName } from './fixtures';

async function fromNative(): Promise<GoalsData | null> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const goals = await invoke<Goal[]>('get_goals');
    const params = new URLSearchParams(window.location.search);
    return {
      goals,
      dateLabel: goals.length > 0 ? 'Tracking' : 'Awaiting first goal',
      initialComposing: params.get('new') === '1',
    };
  } catch {
    return null; // not running under Tauri
  }
}

function fromFixture(): GoalsData {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('s') as ScenarioName | null;
  if (requested && requested in FIXTURES) return FIXTURES[requested];
  return FIXTURES.Rich;
}

export async function loadGoals(): Promise<GoalsData> {
  return (await fromNative()) ?? fromFixture();
}
