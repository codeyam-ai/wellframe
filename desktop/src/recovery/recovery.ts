// Pure, client-safe helpers for the Recovery Center. Label mapping and small
// roll-ups live here; the recovery score reuses the readiness-dial geometry and
// track fills reuse `clampPct`, so there's no duplicated math. Unit-testable
// without a DB or the DOM.

import type { RecoveryFactor } from './models';

export const RECOVERY_STATES = ['strong', 'steady', 'strained'] as const;
export type RecoveryState = (typeof RECOVERY_STATES)[number];

// Human label for a factor state; unknown states pass through unchanged.
export function stateLabel(state: string): string {
  switch (state) {
    case 'strong':
      return 'Strong';
    case 'steady':
      return 'Steady';
    case 'strained':
      return 'Strained';
    default:
      return state;
  }
}

// A factor counts as positive (mint) only when it's strong; steady and strained
// read in ink / signal so the eye lands on what's holding recovery back.
export function isPositiveState(state: string): boolean {
  return state === 'strong';
}

// Human label for a suggested-action kind; unknown kinds title-case the raw
// value as a fallback.
export function actionKindLabel(kind: string): string {
  switch (kind) {
    case 'run':
      return 'Recovery Run';
    case 'rest':
      return 'Rest Day';
    case 'mobility':
      return 'Mobility';
    case 'hydration':
      return 'Hydration';
    case 'walk':
      return 'Walk';
    case 'nutrition':
      return 'Nutrition';
    default:
      return kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : 'Action';
  }
}

// "2 of 6 signals strong" — a one-line read of how many contributing factors
// are in good shape. Returns { strong, total } for the caller to format.
export function factorTally(factors: Pick<RecoveryFactor, 'state'>[]): {
  strong: number;
  total: number;
} {
  const strong = factors.filter((f) => f.state === 'strong').length;
  return { strong, total: factors.length };
}
