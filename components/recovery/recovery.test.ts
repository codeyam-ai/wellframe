import { describe, it, expect } from 'vitest';
import {
  actionKindLabel,
  factorTally,
  isPositiveState,
  stateLabel,
} from './recovery';

describe('stateLabel', () => {
  // Known factor states map to their title-case labels.
  it('maps known states', () => {
    expect(stateLabel('strong')).toBe('Strong');
    expect(stateLabel('steady')).toBe('Steady');
    expect(stateLabel('strained')).toBe('Strained');
  });
  // An unrecognized state string is returned unchanged.
  it('passes an unknown state through', () => {
    expect(stateLabel('mystery')).toBe('mystery');
  });
});

describe('isPositiveState', () => {
  // Only 'strong' counts as positive (mint); steady and strained do not.
  it('is true only for strong', () => {
    expect(isPositiveState('strong')).toBe(true);
    expect(isPositiveState('steady')).toBe(false);
    expect(isPositiveState('strained')).toBe(false);
  });
});

describe('actionKindLabel', () => {
  // Known action kinds map to their human labels.
  it('maps known kinds', () => {
    expect(actionKindLabel('run')).toBe('Recovery Run');
    expect(actionKindLabel('rest')).toBe('Rest Day');
    expect(actionKindLabel('hydration')).toBe('Hydration');
  });
  // An unknown kind is title-cased as a fallback.
  it('title-cases an unknown kind', () => {
    expect(actionKindLabel('sauna')).toBe('Sauna');
  });
  // An empty kind falls back to the generic 'Action' label.
  it('falls back to Action for an empty kind', () => {
    expect(actionKindLabel('')).toBe('Action');
  });
});

describe('factorTally', () => {
  // Counts how many factors are 'strong' out of the total.
  it('counts strong factors out of the total', () => {
    const t = factorTally([
      { state: 'strong' },
      { state: 'steady' },
      { state: 'strong' },
      { state: 'strained' },
    ]);
    expect(t).toEqual({ strong: 2, total: 4 });
  });
  // An empty factor set tallies to zero of zero.
  it('handles an empty set', () => {
    expect(factorTally([])).toEqual({ strong: 0, total: 0 });
  });
});
