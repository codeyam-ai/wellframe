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
- The `codeyam-editor` binary in the sandbox is a **stale dev build**
  (`rebuild-self` fails — no editor Cargo.toml here). Its `isolate` scaffolds
  Next-style routes and `glossary-add` is stricter than documented. This blocks
  codeyam-registry scenario capture for the desktop app (below).
- All work this session was pushed with `--allow-deferred` (a `session-finalize`
  is owed before merge/alignment).

## Pending — decisions needed

### 1. Rename (blocker for icon/README/release finalization)
**"Wellframe" is an existing digital-health company** (care-management platform,
acquired by HealthEdge) — same space, real trademark/confusion risk. Rename before
going public. Constraint from owner: **no "health" in the name; "well"/"wellness" OK.**

Preliminary checks (consumer wellness naming is very saturated):
- ❌ Halcyon — multiple "Halcyon Health" apps on the App Store / Play.
- ❌ Vela — many wellness/fitness apps (Vela AI, Vela Wellness, Vela Pilates).
- ⚠️ Almanac — Almanac.io (funded collaboration-software startup).
- ⚠️ Keel — keel.digital (workplace well-being health-tech).
- ⚠️ Throughline — design/brand agencies hold the mark (different class).
- ~ Cairn — main "Cairn Personalized Health" app is closed; more available.

None fully clear. A coined/abstract word is the safer route. **Any final pick needs
a proper USPTO + domain + App Store search (attorney-grade).** Rename touches:
`tauri.conf.json` (identifier + productName), `desktop/package.json`,
`mcp-server` (id + `defaultDbPath` in `src/db.ts`), READMEs, the release, and the
git remote/repo name if desired.

### 2. App icon
Four options rendered in **`docs/icon-options.html`** (open in a browser) /
**`docs/icon-options.png`**: (1) Signal Dial [blue], (2) Ink Dial [mono],
(3) Bracketed, (4) Readiness Rings [blue+mint]. Pick one, then:
`node` the chosen SVG → 1024px PNG → `cd desktop && npx tauri icon <src.png>`
→ commit the icon set → re-tag (`v0.1.2`) to rebuild.

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
