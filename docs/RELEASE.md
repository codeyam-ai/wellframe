# Testing & Release Runbook

Wellframe ships **two independent artifacts**:

| Artifact | What it is | Version source | Tag namespace |
|---|---|---|---|
| **Desktop app** (`desktop/`) | The Tauri desktop app (macOS/Windows/Linux installers) | `desktop/package.json` + `desktop/src-tauri/tauri.conf.json` | `v*` |
| **Wellframe Coach MCPB** (`mcp-server/`) | An `.mcpb` bundle: an MCP server giving an AI host read-only access to your local `wellframe.db` | `mcp-server/manifest.json` + `mcp-server/package.json` | `mcpb-v*` |

**Everything below is gated so nothing goes public on its own.** Manual CI runs
produce downloadable *test* builds; pushing a tag produces a **draft** GitHub
Release that stays unpublished until you click *Publish* by hand.

---

## 1. Test the MCPB in Claude Desktop

The MCPB reads the same SQLite DB the desktop app writes
(`<app-data>/com.codeyam.wellframe/wellframe.db`) and finds it automatically per
OS — no configuration needed. Nothing is uploaded; it only reads local SQLite.

### Build it locally
```bash
cd mcp-server
npm ci
npm run bundle        # pack → smoke-test (9 tools) → sign
# → build/wellframe-coach.mcpb  (~3.4 MB, self-signed)
```
Optional extra checks:
```bash
npm run validate          # manifest schema
npm run verify-signature  # real PKCS#7 check (mcpb's own `verify` is broken in 2.x)
```

### Install into Claude Desktop
1. Open **Claude Desktop → Settings → Extensions** (Developer/Extensions pane).
2. Drag `mcp-server/build/wellframe-coach.mcpb` onto the window (or use *Install
   from file*).
3. Leave the optional **Wellframe database** path blank — the server defaults to
   the desktop app's DB location. Set it only to point at a different DB.
4. First run the **Wellframe desktop app** and log some data so `wellframe.db`
   exists, otherwise the tools return a friendly "no database yet" message.
5. Ask Claude something like *"What's my readiness today?"* or *"Show my recent
   workouts"* to exercise the 9 tools (`get_readiness`, `list_workouts`,
   `analyze_sleep`, `compute_training_load`, `recommend_recovery`, `list_goals`,
   `recent_checkins`, `estimate_fatigue`, `generate_plan`).

### Or grab a CI-built test bundle
**Actions → MCPB Release → Run workflow** (manual). When it finishes, download the
`wellframe-coach-mcpb` artifact. Same install steps. (CI bundles are unsigned
unless you've configured signing secrets — see §4; unsigned is fully functional.)

---

## 2. Test the Desktop app

> The macOS `.dmg`/`.app` can only be produced on macOS. This repo's Linux dev
> box verifies that the frontend and the Rust crate compile, but cannot emit a
> macOS installer — use your Mac or CI for a runnable macOS build.

### Fastest loop, on your Mac
```bash
cd desktop
npm install
npm run tauri:dev     # live dev window
# or a local installer (unsigned unless you have a Developer ID configured):
npm run tauri:build   # → src-tauri/target/release/bundle/
```

### Cross-platform test installers from CI
**Actions → Desktop Release → Run workflow** (manual). It builds all four targets
and uploads them as downloadable artifacts:
`wellframe-macos-aarch64`, `wellframe-macos-x86_64`, `wellframe-linux-x86_64`,
`wellframe-windows-x86_64`. No release is created.

> macOS test builds from CI are **unsigned/un-notarized** until the Apple secrets
> in §4 are set, so Gatekeeper will warn on first open (right-click → Open). That
> is expected for pre-public testing.

---

## 3. Going public — Desktop app (deliberate, gated)

1. **(For a clean public macOS build)** add the Apple secrets so CI signs and
   notarizes — see §4. Without them the installers build but macOS users hit
   Gatekeeper warnings.
2. **Bump the version** in `desktop/package.json` **and**
   `desktop/src-tauri/tauri.conf.json` (keep them in sync).
3. **Tag and push:**
   ```bash
   git tag v0.1.3
   git push origin v0.1.3
   ```
4. CI (`desktop-release.yml`) builds every platform and creates a **draft**
   GitHub Release with the installers attached.
5. **Review** the draft under *Releases*, then click **Publish** to make it
   public. Nothing is public until this click.

## 4. Going public — MCPB (deliberate, gated)

1. **(Optional) sign in CI** with the same stable identity as your local builds:
   ```bash
   # openssl base64 is portable (macOS's base64 has no -w); -A = no line wrapping
   openssl base64 -A -in mcp-server/.signing/cert.pem   # → secret MCPB_SIGNING_CERT
   openssl base64 -A -in mcp-server/.signing/key.pem    # → secret MCPB_SIGNING_KEY
   ```
   Add both as repo **Actions secrets**. Unset ⇒ CI ships an unsigned (still
   functional) bundle. Note: `.mcpb` signing is **tamper-evidence only** — mcpb
   2.x cannot verify publisher identity — so signing is optional for distribution.
2. **Bump the version** in `mcp-server/manifest.json` **and**
   `mcp-server/package.json`.
3. **Tag and push:**
   ```bash
   git tag mcpb-v0.1.1
   git push origin mcpb-v0.1.1
   ```
4. CI (`mcpb-release.yml`) builds + smoke-tests + validates, then attaches the
   `.mcpb` to a **draft** GitHub Release for that tag.
5. **Review** and **Publish** the draft to make it public.

### Apple signing/notarization secrets (Desktop, §3)
Set these repo Actions secrets to un-inert macOS signing in `desktop-release.yml`:

| Secret | Purpose |
|---|---|
| `APPLE_CERTIFICATE` | base64 of the Developer ID `.p12` |
| `APPLE_CERTIFICATE_PASSWORD` | password for that `.p12` |
| `APPLE_SIGNING_IDENTITY` | e.g. `Developer ID Application: … (88QLZH998K)` |
| `APPLE_API_ISSUER` | App Store Connect API issuer ID (notarization) |
| `APPLE_API_KEY` | App Store Connect API key ID (notarization) |
| `APPLE_API_KEY_P8` | base64 of the App Store Connect `.p8` key file |

`APPLE_TEAM_ID` (`88QLZH998K`) is already baked into the workflow. Windows
Authenticode signing is not yet wired (add a signing step when you have a cert).

---

## Quick reference

| I want to… | Do this |
|---|---|
| Test the MCPB now | `cd mcp-server && npm run bundle`, install the `.mcpb` in Claude Desktop |
| Test the desktop app now (Mac) | `cd desktop && npm run tauri:dev` |
| Get test installers for all OSes | Actions → *Desktop Release* → Run workflow → download artifacts |
| Get a test `.mcpb` from CI | Actions → *MCPB Release* → Run workflow → download artifact |
| Publish the desktop app | bump version → `git tag v0.x.y && git push` → publish the draft |
| Publish the MCPB | bump version → `git tag mcpb-v0.x.y && git push` → publish the draft |
