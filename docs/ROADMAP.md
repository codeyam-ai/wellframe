# Wellframe — status & roadmap (handoff)

Snapshot for pausing / rebuilding the VM. Everything described as "shipped" is
committed to `origin/main`; everything under "Pending" is captured here so it
isn't lost.

## Shipped (on origin/main)

- **Desktop app** (`desktop/`) — Tauri 2 + React + Vite + TypeScript. All six
  consoles (Dashboard, Timeline, Trends, Recovery, Goals, Check-in) with a
  client router, native SQLite reads via Rust commands, and two write paths
  (`create_goal`, `submit_checkin`). Bundle id `com.codeyam.wellframe`.
- **Signed release** — tag `v0.1.1` builds signed + notarized macOS `.dmg`
  (Apple Silicon + Intel) plus Windows `.msi`/`.exe` and Linux
  `.AppImage`/`.deb`/`.rpm` via `.github/workflows/desktop-release.yml`. The
  release is currently a **DRAFT** — publish it at /releases when ready.
- **MCP bundle** (`mcp-server/`) — "Wellframe Coach" MCP server, 9 tools over the
  local SQLite (readiness, workouts, sleep, training load, recovery, goals,
  check-ins, `estimate_fatigue`, `generate_plan`). Reads via sql.js (WASM);
  `npm run pack` → a portable `.mcpb`. Not yet published/signed.
- **codeyam alignment (partial)** — glossary + 131 tests registered (7 ported TS
  helper test files + Rust read/write tests). Desktop scenarios captured to
  `desktop/scenarios/` (not yet in codeyam's registry — see below).
- **Docs** — `desktop/SIGNING.md`, `docs/ios-companion.md` (separate track),
  `docs/icon-options.html` (icon proposals).

## Environment notes (for the rebuilt VM)

- Apple signing is wired. **6 GitHub secrets** are set: `APPLE_CERTIFICATE`
  (Developer ID Application: Nod Labs, Inc.), `APPLE_CERTIFICATE_PASSWORD`,
  `APPLE_SIGNING_IDENTITY`, `APPLE_API_ISSUER`, `APPLE_API_KEY`,
  `APPLE_API_KEY_P8`. Team ID `88QLZH998K` is hardcoded in the workflow.
- The `codeyam-editor` binary is now current (0.1.7) on the rebuilt VM — the
  earlier "stale dev build" blocker on desktop scenario capture is resolved.

## Pending — decisions needed

### 1. Name — RESOLVED: keeping Wellframe
**Decision (2026-07-17): keep "Wellframe."** There is an existing digital-health
Wellframe (B2B care-management, acquired by HealthEdge), but this is a B2C consumer
side project in a different sub-class, so the collision is acceptable for now.
**Backup name if it ever needs to change: Artesian.** (52 alternatives were screened;
~80% collided with an existing health app — Artesian was the cleanest survivor.)

### 2. App icon — RESOLVED
Final mark: **"Signal / Nested gauge"** — an outer readiness arc (blue, on a tick
track, with a luminous terminus) around an inner recovery gauge (mint), on the
Plinth deep-ink squircle. Master art lives at **`desktop/branding/wellframe-icon.svg`**
(→ `wellframe-icon-1024.png`); the full platform set was regenerated into
`desktop/src-tauri/icons/` via `npx tauri icon`. To revise: edit the SVG, re-render
with sharp, re-run `npx tauri icon branding/wellframe-icon-1024.png`. Re-tag
(`v0.1.2`) to ship a rebuild.

## Pending — work

- **README as a codeyam showcase** — root `README.md` still documents the retired
  Next.js app. Rewrite it to present the desktop app + mcpb + the scenario-driven
  build loop (model on the `tabcommand` / `codeyam-counter` example repos). The
  codeyam-managed sections use `codeyam-editor editor readme-sync`.
- **Finish codeyam alignment** — register the desktop component scenarios in
  codeyam's registry (blocked on a current editor binary that serves the desktop
  app on :1420), register `App`, add a test for `trends/fromNative` (its
  metric/points join isn't covered), then `session-finalize` to green.
- **Retire the Next.js app** — once the desktop scenarios are registry-captured:
  flip codeyam capture to the desktop app, then delete `app/`, `components/`,
  `prisma/`, root Next configs, and the root `.codeyam/scenarios/*` for the web app.
- **Wire deferred mutations** — CoachDock (⌘K) and the ConnectionsPanel
  (provider connect/disconnect) are inert; make them Tauri commands.
- **Publish the mcpb** — `cd mcp-server && npm run pack`, optionally sign
  (`npx @anthropic-ai/mcpb sign`), and wire it as the desktop app's own coach
  backend (not just Claude Desktop). Deepen tools (find-similar-weeks, race
  prediction) per the PRD.
- **Publish the release** — the `v0.1.1` GitHub Release is a draft; publish when
  the name/icon are finalized (likely as `v0.1.2` after the icon rebuild).
- **iOS companion** — separate track, see `docs/ios-companion.md`. Not started.
