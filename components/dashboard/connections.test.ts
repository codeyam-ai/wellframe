import { describe, it, expect } from 'vitest';
import { asFresh, AI_PROVIDERS, HEALTH_SOURCES, type Provider } from './connections';

describe('asFresh', () => {
  const sample: Provider[] = [
    { id: 'a', name: 'A', blurb: 'first', connected: true, detail: 'Synced 07:02' },
    { id: 'b', name: 'B', blurb: 'second' },
  ];

  // When not fresh, the list is returned as-is (identity preserved).
  it('returns the same list reference when fresh is false', () => {
    expect(asFresh(sample, false)).toBe(sample);
  });

  // Fresh mode clears every connected flag to false.
  it('clears connected on every provider when fresh is true', () => {
    const result = asFresh(sample, true);
    expect(result.every((p) => p.connected === false)).toBe(true);
  });

  // Fresh mode strips the detail string so no stale status shows.
  it('strips detail on every provider when fresh is true', () => {
    const result = asFresh(sample, true);
    expect(result.every((p) => p.detail === undefined)).toBe(true);
  });

  // Fresh mode preserves identifying fields (id, name, blurb).
  it('preserves id, name, and blurb when fresh is true', () => {
    const result = asFresh(sample, true);
    expect(result.map((p) => [p.id, p.name, p.blurb])).toEqual([
      ['a', 'A', 'first'],
      ['b', 'B', 'second'],
    ]);
  });

  // Fresh mode does not mutate the input list.
  it('does not mutate the original list when fresh is true', () => {
    asFresh(sample, true);
    expect(sample[0].connected).toBe(true);
    expect(sample[0].detail).toBe('Synced 07:02');
  });

  // Empty input yields an empty list in both modes.
  it('handles an empty list', () => {
    expect(asFresh([], true)).toEqual([]);
    expect(asFresh([], false)).toEqual([]);
  });

  // The real AI provider config has Claude pre-connected until made fresh.
  it('resets the pre-connected Claude entry in the real AI config', () => {
    const claude = AI_PROVIDERS.find((p) => p.id === 'claude');
    expect(claude?.connected).toBe(true);
    const fresh = asFresh(AI_PROVIDERS, true).find((p) => p.id === 'claude');
    expect(fresh?.connected).toBe(false);
    expect(fresh?.detail).toBeUndefined();
  });

  // The real health-source config also resets under fresh mode.
  it('resets the pre-connected Apple Health entry in the real health config', () => {
    const fresh = asFresh(HEALTH_SOURCES, true).find((p) => p.id === 'apple');
    expect(fresh?.connected).toBe(false);
    expect(fresh?.detail).toBeUndefined();
  });
});
