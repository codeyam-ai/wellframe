---
title: "Provider Connection Integration"
mode: ui
createdAt: "2026-07-08"
source: feature-request
---

# Provider Connection Integration

Turn the stubbed 3-step "Connect" explainer into a **real, persisted** connection
system for AI coaches and health sources — with a choice of connection methods per
provider, connection state saved to the database, and the ability to pick an active
coach.

## Scope boundary (read this first)

This is the codeyam Next.js/Prisma/SQLite **web preview**, not the Tauri desktop
app, and the production DB starts empty. So "real" means the **state machine,
persistence, and UI are real** — the external network handshake (OAuth redirect,
live key check against Anthropic/Garmin, a real running Ollama/MCP server) is
**simulated deterministically** in this environment. Per-scenario state lives in the
DB and is read on every request (`force-dynamic`), so each scenario seeds its own
connection state — no launch-time-only config.

## New data model

`ProviderConnection` (Prisma, SQLite):

- `id` — autoincrement
- `providerId` — "claude" | "gemini" | "openai" | "ollama" | "lmstudio" | "mcp-local" | "apple" | "garmin" | "oura" | "whoop"
- `kind` — "ai" | "health"
- `method` — "oauth" | "apiKey" | "localEndpoint" | "mcp"
- `status` — "connected" | "synced" | "error"
- `detail` — status line ("Local · 0 cloud calls", "Synced 07:02", "key ••••4f2a", or an error message)
- `endpoint` — nullable, for local/mcp
- `isActiveCoach` — bool (only one AI row true at a time)
- `connectedAt` — ISO timestamp

The **catalog of available providers stays static** (`connections.ts`); the DB stores
which ones are connected and how. Day-one = zero rows = everything shows "Connect".

## Provider catalog + methods (`connections.ts`, client-safe)

Each provider declares the methods it supports; the method chooser shows only those:

- **AI · cloud** — Claude, Gemini, OpenAI → **Browser sign-in** + **Paste API key**
- **AI · local** — Ollama, LM Studio → **Local endpoint** (auto-detect + URL)
- **AI · local MCP** — "Local MCP server" → **MCP endpoint** (connect an
  MCP-compatible local model by endpoint; mocked handshake returns the served model)
- **Health** — Apple Health → **companion sync**; Garmin / Oura / Whoop → **Browser
  sign-in** + **Paste API key** (same real flow as AI, per request)

## Pure helpers (co-located unit tests, like `format.ts` / `dial.ts`)

- `validateConnectInput(method, value)` → `string | null` (non-empty key; URL/host for endpoint/mcp)
- `mergeCatalog(catalog, connections)` → view-model rows (connected / active / status)
- `maskKey(key)` → `"••••4f2a"`

The existing `asFresh` helper is **removed** (superseded by the DB merge) — tracked
deletion + glossary cleanup.

## Server (the app's first write path)

- `app/lib/connections.server.ts` — `getConnections()` read (server-only, imports prisma)
- **Server actions** (`'use server'`): `connectProvider(providerId, method, value)`,
  `disconnectProvider(providerId)`, `setActiveCoach(providerId)` — mocked handshake →
  persist → `revalidatePath('/')`

## UI

- **ConnectionsPanel** takes the merged connection view-model as props (like it takes
  the catalog today), so every state renders from seeded props.
- Per-row **Connect** opens a **method chooser**; each method renders its mini-form
  (API-key field / endpoint field / sign-in button), with **validating** and **error**
  states.
- Connected rows show a real status pill; **AI rows** get **"Set as active"** + an
  active marker; every connected row can **Disconnect**.
- `DashboardConsole` / `app/page.tsx` load `getConnections()`, pass it down, and wire
  the server actions. The coach dock / coach signature reflect the active coach (light
  touch).

## Scenarios (prod empty; each seeds `ProviderConnection`)

**Component** (ConnectionsPanel + new sub-components):
- Day-one — nothing connected
- Method chooser open
- API-key entry
- Validating (in-flight)
- Error — invalid key / unreachable endpoint
- One AI connected + active (Claude)
- Local MCP connected
- Multiple connected, one active — switch / disconnect
- Health synced

**Application** (`/`):
- Connections populated — several connected, one active coach
- Day-one setup — nothing connected

## Files

- **New**: `ProviderConnection` model; `app/lib/connections.server.ts` (+ actions);
  method-chooser + per-method form components; connection view-model helpers + tests.
- **Modified**: `connections.ts` (catalog + methods, remove `asFresh`),
  `ConnectionsPanel`, `ConnectionsGroup`, `ProviderRow`, `ProviderConnectFlow`
  (becomes the method chooser), `DashboardConsole`, `app/page.tsx`,
  `prisma/schema.prisma`.

## Follow-ups / deferred

- Real OAuth redirect + live key validation + real Ollama/MCP ping (mocked here).
- Secret-at-rest encryption (SQLCipher) is a desktop-app concern; preview stores keys
  masked.
