import { describe, it, expect } from 'vitest';
import {
  validateConnectInput,
  resolveConnection,
  mergeCatalog,
  activeCoach,
  maskKey,
  AI_PROVIDERS,
  HEALTH_SOURCES,
  type ConnectionRow,
} from './connections';

describe('validateConnectInput', () => {
  it('requires a non-trivial API key', () => {
    expect(validateConnectInput('apiKey', '')).toBeTruthy();
    expect(validateConnectInput('apiKey', 'short')).toBeTruthy();
    expect(validateConnectInput('apiKey', 'sk-abcdef123456')).toBeNull();
  });

  it('accepts url or host:port endpoints, rejects junk', () => {
    expect(validateConnectInput('localEndpoint', 'http://localhost:11434')).toBeNull();
    expect(validateConnectInput('localEndpoint', 'localhost:11434')).toBeNull();
    expect(validateConnectInput('localEndpoint', 'not an address')).toBeTruthy();
  });

  it('needs no input for oauth', () => {
    expect(validateConnectInput('oauth', '')).toBeNull();
  });
});

describe('resolveConnection', () => {
  it('rejects unknown providers and unsupported methods', () => {
    expect(resolveConnection('nope', 'apiKey', 'x').ok).toBe(false);
    // ollama only supports localEndpoint
    expect(resolveConnection('ollama', 'apiKey', 'sk-abcdefghijkl').ok).toBe(false);
  });

  it('maps an AI apiKey connect to connected + masked detail', () => {
    const r = resolveConnection('claude', 'apiKey', 'sk-abcdef123456');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.status).toBe('connected');
      expect(r.detail).toContain('3456');
      expect(r.detail).toContain('••••');
    }
  });

  it('maps a health oauth connect to synced', () => {
    const r = resolveConnection('apple', 'oauth', '');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.status).toBe('synced');
  });

  it('fails an obviously-offline local endpoint', () => {
    expect(resolveConnection('ollama', 'localEndpoint', 'http://localhost:9999').ok).toBe(false);
    expect(resolveConnection('ollama', 'localEndpoint', 'http://localhost:11434').ok).toBe(true);
  });
});

describe('mergeCatalog + activeCoach', () => {
  const row: ConnectionRow = {
    providerId: 'claude',
    kind: 'ai',
    method: 'apiKey',
    status: 'connected',
    detail: 'Key ••••3456',
    endpoint: null,
    isActiveCoach: true,
    connectedAt: '2026-01-01T00:00:00.000Z',
  };

  it('marks the stored provider connected and surfaces the active coach', () => {
    const views = mergeCatalog(AI_PROVIDERS, [row]);
    const claude = views.find((v) => v.id === 'claude')!;
    expect(claude.connected).toBe(true);
    expect(claude.isActiveCoach).toBe(true);
    expect(activeCoach(views)?.id).toBe('claude');
  });

  it('does not count an errored row as connected', () => {
    const views = mergeCatalog(HEALTH_SOURCES, [
      { ...row, providerId: 'oura', kind: 'health', status: 'error', isActiveCoach: false },
    ]);
    expect(views.find((v) => v.id === 'oura')!.connected).toBe(false);
  });

  it('leaves uncatalogued providers unconnected', () => {
    expect(mergeCatalog(AI_PROVIDERS, []).every((v) => !v.connected)).toBe(true);
  });
});

describe('maskKey', () => {
  it('keeps the last four', () => {
    expect(maskKey('sk-abcdef1234')).toBe('••••1234');
    expect(maskKey('xy')).toBe('••••');
  });
});
