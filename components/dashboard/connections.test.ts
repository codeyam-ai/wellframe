import { describe, it, expect } from 'vitest';
import {
  validateConnectInput,
  maskKey,
  mergeCatalog,
  activeCoach,
  resolveConnection,
  toConnectionRow,
  AI_PROVIDERS,
  findProvider,
  type ConnectionRow,
  type CatalogProvider,
} from './connections';

describe('validateConnectInput', () => {
  // A non-empty, reasonable-length API key passes.
  it('accepts a plausible API key', () => {
    expect(validateConnectInput('apiKey', 'sk-abcdef123456')).toBeNull();
  });

  // An empty key is rejected with a prompt to paste one.
  it('rejects an empty API key', () => {
    expect(validateConnectInput('apiKey', '   ')).toMatch(/paste your api key/i);
  });

  // A too-short key is rejected as likely truncated.
  it('rejects a too-short API key', () => {
    expect(validateConnectInput('apiKey', 'sk-123')).toMatch(/too short/i);
  });

  // A full URL endpoint passes for local + mcp methods.
  it('accepts a URL endpoint for localEndpoint and mcp', () => {
    expect(validateConnectInput('localEndpoint', 'http://localhost:11434')).toBeNull();
    expect(validateConnectInput('mcp', 'https://127.0.0.1:8080/mcp')).toBeNull();
  });

  // A host:port endpoint passes.
  it('accepts a host:port endpoint', () => {
    expect(validateConnectInput('localEndpoint', 'localhost:11434')).toBeNull();
  });

  // Garbage that is neither a URL nor host:port is rejected.
  it('rejects a non-address endpoint value', () => {
    expect(validateConnectInput('localEndpoint', 'my model')).toMatch(/address/i);
  });

  // An empty endpoint is rejected.
  it('rejects an empty endpoint', () => {
    expect(validateConnectInput('mcp', '')).toMatch(/enter the address/i);
  });

  // OAuth needs no typed input, so any value is fine.
  it('never rejects oauth regardless of value', () => {
    expect(validateConnectInput('oauth', '')).toBeNull();
    expect(validateConnectInput('oauth', 'anything')).toBeNull();
  });
});

describe('maskKey', () => {
  // A normal key keeps only its last four characters.
  it('masks all but the last four characters', () => {
    expect(maskKey('sk-abcdef1234wxyz')).toBe('••••wxyz');
  });

  // A very short key is fully masked.
  it('fully masks a key of four or fewer characters', () => {
    expect(maskKey('ab')).toBe('••••');
    expect(maskKey('abcd')).toBe('••••');
  });

  // Surrounding whitespace is trimmed before masking.
  it('trims whitespace before masking', () => {
    expect(maskKey('  sk-longenough9999  ')).toBe('••••9999');
  });
});

describe('mergeCatalog', () => {
  const catalog: CatalogProvider[] = [
    { id: 'claude', name: 'Claude', blurb: '…', kind: 'ai', methods: ['oauth', 'apiKey'] },
    { id: 'ollama', name: 'Ollama', blurb: '…', kind: 'ai', methods: ['localEndpoint'] },
  ];
  const rows: ConnectionRow[] = [
    { providerId: 'claude', kind: 'ai', method: 'oauth', status: 'connected', detail: 'Connected', endpoint: null, isActiveCoach: true, connectedAt: 't' },
  ];

  // A provider with no row is not connected and not active.
  it('leaves providers without a row disconnected', () => {
    const views = mergeCatalog(catalog, rows);
    const ollama = views.find((v) => v.id === 'ollama')!;
    expect(ollama.connected).toBe(false);
    expect(ollama.connection).toBeNull();
    expect(ollama.isActiveCoach).toBe(false);
  });

  // A provider with a connected row reflects connected + active state.
  it('marks a provider with a connected row as connected and active', () => {
    const views = mergeCatalog(catalog, rows);
    const claude = views.find((v) => v.id === 'claude')!;
    expect(claude.connected).toBe(true);
    expect(claude.isActiveCoach).toBe(true);
    expect(claude.connection?.detail).toBe('Connected');
  });

  // An error-status row surfaces the connection but is NOT counted as connected.
  it('does not count an error row as connected', () => {
    const errRows: ConnectionRow[] = [
      { providerId: 'claude', kind: 'ai', method: 'apiKey', status: 'error', detail: 'bad key', endpoint: null, isActiveCoach: false, connectedAt: 't' },
    ];
    const claude = mergeCatalog(catalog, errRows).find((v) => v.id === 'claude')!;
    expect(claude.connected).toBe(false);
    expect(claude.connection?.status).toBe('error');
  });

  // Output order follows the catalog, not the rows.
  it('preserves catalog order', () => {
    expect(mergeCatalog(catalog, rows).map((v) => v.id)).toEqual(['claude', 'ollama']);
  });
});

describe('activeCoach', () => {
  const catalog: CatalogProvider[] = [
    { id: 'claude', name: 'Claude', blurb: '…', kind: 'ai', methods: ['oauth'] },
    { id: 'gemini', name: 'Gemini', blurb: '…', kind: 'ai', methods: ['oauth'] },
  ];

  // Returns the view whose row is the active coach.
  it('returns the active coach when one is set', () => {
    const views = mergeCatalog(catalog, [
      { providerId: 'gemini', kind: 'ai', method: 'oauth', status: 'connected', detail: null, endpoint: null, isActiveCoach: true, connectedAt: 't' },
    ]);
    expect(activeCoach(views)?.id).toBe('gemini');
  });

  // Returns null when nothing is active.
  it('returns null when no coach is active', () => {
    expect(activeCoach(mergeCatalog(catalog, []))).toBeNull();
  });
});

describe('findProvider', () => {
  // Looks up a real catalog provider by id.
  it('finds a known provider', () => {
    expect(findProvider('claude')?.name).toBe('Claude');
  });

  // Returns undefined for an unknown id.
  it('returns undefined for an unknown id', () => {
    expect(findProvider('nope')).toBeUndefined();
  });

  // Every AI provider declares at least one connect method.
  it('gives every AI provider at least one method', () => {
    expect(AI_PROVIDERS.every((p) => p.methods.length > 0)).toBe(true);
  });
});

describe('resolveConnection', () => {
  // A pasted key on a cloud AI provider connects with a masked-key detail.
  it('resolves an apiKey connect to a connected status with a masked-key detail', () => {
    const r = resolveConnection('claude', 'apiKey', 'sk-ant-abcd1234wxyz');
    expect(r).toEqual({ ok: true, status: 'connected', detail: 'Key ••••wxyz', endpoint: null });
  });

  // A local endpoint connects and records the endpoint.
  it('resolves a localEndpoint connect and keeps the endpoint', () => {
    const r = resolveConnection('ollama', 'localEndpoint', 'http://localhost:11434');
    expect(r).toEqual({ ok: true, status: 'connected', detail: 'Local · 0 cloud calls', endpoint: 'http://localhost:11434' });
  });

  // An MCP endpoint connects with the MCP detail.
  it('resolves an mcp connect with the MCP detail', () => {
    const r = resolveConnection('mcp-local', 'mcp', 'http://localhost:8080/mcp');
    expect(r).toEqual({ ok: true, status: 'connected', detail: 'MCP · local model', endpoint: 'http://localhost:8080/mcp' });
  });

  // A health provider connecting via oauth ends up synced, not connected.
  it('resolves a health oauth connect to synced', () => {
    const r = resolveConnection('apple', 'oauth', '');
    expect(r).toEqual({ ok: true, status: 'synced', detail: 'Synced just now', endpoint: null });
  });

  // An unreachable local endpoint fails with a friendly error.
  it('fails an unreachable local endpoint', () => {
    const r = resolveConnection('ollama', 'localEndpoint', 'http://localhost:9999');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/couldn't reach/i);
  });

  // An unknown provider is rejected.
  it('rejects an unknown provider', () => {
    expect(resolveConnection('nope', 'oauth', '')).toEqual({ ok: false, error: 'Unknown provider.' });
  });

  // A method the provider does not support is rejected.
  it('rejects an unsupported method for the provider', () => {
    const r = resolveConnection('ollama', 'apiKey', 'sk-whatever12345');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not available/i);
  });

  // A too-short key is rejected via the shared validator.
  it('rejects a too-short api key', () => {
    const r = resolveConnection('gemini', 'apiKey', 'sk-1');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/too short/i);
  });
});

describe('toConnectionRow', () => {
  // Narrows a raw DB row's string columns to the typed ConnectionRow unions and
  // drops the extra id, preserving the remaining fields.
  it('narrows a raw row to a typed ConnectionRow', () => {
    const raw = {
      id: 7,
      providerId: 'claude',
      kind: 'ai',
      method: 'mcp',
      status: 'connected',
      detail: 'MCP · local model',
      endpoint: 'http://localhost:8080/mcp',
      isActiveCoach: true,
      connectedAt: '2026-07-06T07:02:00Z',
    };
    expect(toConnectionRow(raw)).toEqual({
      providerId: 'claude',
      kind: 'ai',
      method: 'mcp',
      status: 'connected',
      detail: 'MCP · local model',
      endpoint: 'http://localhost:8080/mcp',
      isActiveCoach: true,
      connectedAt: '2026-07-06T07:02:00Z',
    });
  });

  // Preserves null optional fields.
  it('preserves null detail and endpoint', () => {
    const row = toConnectionRow({ providerId: 'apple', kind: 'health', method: 'oauth', status: 'synced', detail: null, endpoint: null, isActiveCoach: false, connectedAt: 't' });
    expect(row.detail).toBeNull();
    expect(row.endpoint).toBeNull();
  });
});
