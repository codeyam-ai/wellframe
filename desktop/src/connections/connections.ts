// Catalog + pure helpers for provider connections. Ported verbatim from the web
// app (components/dashboard/connections.ts) — it has no server imports, so the
// desktop Connections panel shares the exact same catalog, validation, and the
// deterministic connect resolver. Persistence differs (Tauri commands vs. Prisma
// Server Actions), but the handshake semantics are identical.

export type ProviderKind = 'ai' | 'health';
export type ConnectMethod = 'oauth' | 'apiKey' | 'localEndpoint' | 'mcp';
export type ConnectionStatus = 'connected' | 'synced' | 'error';

export interface CatalogProvider {
  id: string;
  name: string;
  blurb: string;
  kind: ProviderKind;
  // Supported connect methods, in the order they should be offered.
  methods: ConnectMethod[];
}

// The stored connection row (mirrors the provider_connection table).
export interface ConnectionRow {
  providerId: string;
  kind: ProviderKind;
  method: ConnectMethod;
  status: ConnectionStatus;
  detail: string | null;
  endpoint: string | null;
  isActiveCoach: boolean;
  connectedAt: string;
}

// A catalog provider merged with its connection row (if any) — what the UI renders.
export interface ProviderView extends CatalogProvider {
  connection: ConnectionRow | null;
  connected: boolean;
  isActiveCoach: boolean;
}

export const AI_PROVIDERS: CatalogProvider[] = [
  { id: 'claude', name: 'Claude', blurb: 'Anthropic. Strong reasoning, great at long-term coaching.', kind: 'ai', methods: ['oauth', 'apiKey'] },
  { id: 'gemini', name: 'Gemini', blurb: "Google's model. Fast, good with plans.", kind: 'ai', methods: ['oauth', 'apiKey'] },
  { id: 'openai', name: 'OpenAI', blurb: 'ChatGPT models. Broad general knowledge.', kind: 'ai', methods: ['oauth', 'apiKey'] },
  { id: 'ollama', name: 'Ollama', blurb: 'Run open models locally. Nothing leaves this machine.', kind: 'ai', methods: ['localEndpoint'] },
  { id: 'lmstudio', name: 'LM Studio', blurb: 'Local models with a friendly desktop runtime.', kind: 'ai', methods: ['localEndpoint'] },
  { id: 'mcp-local', name: 'Local MCP server', blurb: 'Connect an MCP-compatible local model by its endpoint.', kind: 'ai', methods: ['mcp'] },
];

export const HEALTH_SOURCES: CatalogProvider[] = [
  { id: 'apple', name: 'Apple Health', blurb: 'Sleep, heart rate, steps from your iPhone or Watch.', kind: 'health', methods: ['oauth'] },
  { id: 'garmin', name: 'Garmin', blurb: 'Runs, HRV, and recovery from your watch.', kind: 'health', methods: ['oauth', 'apiKey'] },
  { id: 'oura', name: 'Oura', blurb: 'Overnight sleep and readiness from your ring.', kind: 'health', methods: ['oauth', 'apiKey'] },
  { id: 'whoop', name: 'Whoop', blurb: 'Strain and recovery from your band.', kind: 'health', methods: ['oauth', 'apiKey'] },
];

export const ALL_PROVIDERS: CatalogProvider[] = [...AI_PROVIDERS, ...HEALTH_SOURCES];

export function findProvider(id: string): CatalogProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}

export interface MethodMeta {
  id: ConnectMethod;
  label: string;
  hint: string;
  // What the connect action needs: a typed value, or nothing (browser sign-in).
  needsInput: boolean;
  placeholder?: string;
}

export const METHOD_META: Record<ConnectMethod, MethodMeta> = {
  oauth: {
    id: 'oauth',
    label: 'Sign in with your browser',
    hint: 'We open the provider, you approve once — no codes to copy.',
    needsInput: false,
  },
  apiKey: {
    id: 'apiKey',
    label: 'Paste an API key',
    hint: 'Bring your own key. It stays on this machine.',
    needsInput: true,
    placeholder: 'sk-…',
  },
  localEndpoint: {
    id: 'localEndpoint',
    label: 'Connect locally',
    hint: 'Point Wellframe at a model running on this machine.',
    needsInput: true,
    placeholder: 'http://localhost:11434',
  },
  mcp: {
    id: 'mcp',
    label: 'Local MCP server',
    hint: 'Connect an MCP-compatible local model by its endpoint.',
    needsInput: true,
    placeholder: 'http://localhost:8080/mcp',
  },
};

// Validate the typed input for a connect method. Returns an error string to show
// the user, or null when the input is acceptable. `oauth` needs no input.
export function validateConnectInput(method: ConnectMethod, value: string): string | null {
  const v = (value ?? '').trim();
  if (method === 'apiKey') {
    if (!v) return 'Paste your API key to continue.';
    if (v.length < 12) return 'That key looks too short — double-check you copied all of it.';
    return null;
  }
  if (method === 'localEndpoint' || method === 'mcp') {
    if (!v) return 'Enter the address where your model is running.';
    const isUrl = /^https?:\/\/.+/i.test(v);
    const isHostPort = /^[\w.-]+:\d+$/.test(v);
    if (!isUrl && !isHostPort) return 'Use an address like http://localhost:11434 or host:port.';
    return null;
  }
  return null;
}

// Mask an API key for display, keeping the last four characters.
export function maskKey(key: string): string {
  const v = (key ?? '').trim();
  if (v.length <= 4) return '••••';
  return '••••' + v.slice(-4);
}

// Merge the static catalog with stored connection rows into view-model rows.
// A row with status "error" is surfaced but does NOT count as connected.
export function mergeCatalog(catalog: CatalogProvider[], rows: ConnectionRow[]): ProviderView[] {
  const byId = new Map(rows.map((r) => [r.providerId, r]));
  return catalog.map((p) => {
    const connection = byId.get(p.id) ?? null;
    return {
      ...p,
      connection,
      connected: connection != null && connection.status !== 'error',
      isActiveCoach: connection?.isActiveCoach ?? false,
    };
  });
}

// The active-coach view among a set of merged rows, if any.
export function activeCoach(views: ProviderView[]): ProviderView | null {
  return views.find((v) => v.isActiveCoach) ?? null;
}

export interface ResolveSuccess {
  ok: true;
  status: ConnectionStatus;
  detail: string;
  endpoint: string | null;
}
export interface ResolveFailure {
  ok: false;
  error: string;
}
export type ResolveResult = ResolveSuccess | ResolveFailure;

// Pure resolution of a connect attempt: checks the provider + method are valid,
// validates any typed input, then maps the method to the status + status-line
// detail to persist — or an error to show. No side effects, no network: the
// deterministic stand-in for the real provider handshake.
export function resolveConnection(
  providerId: string,
  method: ConnectMethod,
  value: string,
): ResolveResult {
  const provider = findProvider(providerId);
  if (!provider) return { ok: false, error: 'Unknown provider.' };
  if (!provider.methods.includes(method)) {
    return { ok: false, error: 'That connection method is not available for this provider.' };
  }
  const inputError = validateConnectInput(method, value);
  if (inputError) return { ok: false, error: inputError };

  const isHealth = provider.kind === 'health';
  const v = (value ?? '').trim();

  if (method === 'apiKey') {
    return {
      ok: true,
      status: isHealth ? 'synced' : 'connected',
      detail: isHealth ? 'Synced just now' : `Key ${maskKey(v)}`,
      endpoint: null,
    };
  }
  if (method === 'localEndpoint' || method === 'mcp') {
    // Simulated reachability probe: an obviously-offline host fails.
    if (/offline|unreachable|:9999\b/i.test(v)) {
      return { ok: false, error: "Couldn't reach that address — is your model running?" };
    }
    return {
      ok: true,
      status: 'connected',
      detail: method === 'mcp' ? 'MCP · local model' : 'Local · 0 cloud calls',
      endpoint: v,
    };
  }
  // oauth (browser sign-in / device pairing)
  return {
    ok: true,
    status: isHealth ? 'synced' : 'connected',
    detail: isHealth ? 'Synced just now' : 'Connected · signed in',
    endpoint: null,
  };
}
