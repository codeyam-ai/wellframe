# Wellframe Desktop

The native desktop build of Wellframe — **Tauri 2 + React + Vite + TypeScript**.
Cross-platform (macOS · Windows · Linux), local-first, with data reached through
Rust commands rather than a bundled web server.

This is a **companion app** to the root Next.js web app. The two are isolated:
this one lives entirely under `desktop/` with its own `apps[]` entry in
`.codeyam/editor.json`. The web app is untouched and remains the scenario/preview
reference for the UI being ported across.

## Status

- ✅ **Shell skeleton** — native window, React↔Rust IPC bridge, builds + bundles
  end-to-end (a Linux `.deb` is produced by `npm run tauri:build`).
- ✅ **All six consoles** — Dashboard, Timeline, Trends, Recovery, Goals, Check-in,
  with a client-side router. UI ported from the Next.js app.
- ✅ **Native data layer** — `get_*` Rust commands read local SQLite; the TS layer
  derives each console's view shape. Browser preview uses `?s=<Scenario>` fixtures.
- ✅ **Write paths** — `create_goal` + `submit_checkin` Tauri commands persist to
  SQLite (validated by the shared TS helpers; no-op in the browser preview).
- ⬜ CoachDock (⌘K) + provider Connections
- ⬜ SQLCipher encryption on the database
- ⬜ AI coach provider layer (bring-your-own-key)
- ⬜ MCP server → `.mcpb` bundle
- ⬜ Signing / notarization + installers

## Develop

```bash
cd desktop
npm install
npm run dev          # Vite frontend on http://localhost:1420 (renders in the codeyam preview)
npm run tauri:dev    # native window wrapping the Vite dev server (needs a display + GTK/webkit)
```

The frontend runs in a plain browser too (that's how codeyam previews it) — when the
Tauri API is absent it degrades gracefully instead of erroring.

## Build installers

```bash
npm run tauri:build                  # native bundle for the host OS
npm run tauri:build -- --bundles deb # pick a specific bundle target
```

**A macOS `.dmg`/`.app` can only be built on macOS.** On Linux you get `.deb`/AppImage;
on Windows, `.msi`/NSIS. Cross-OS artifacts come from CI — see
`.github/workflows/desktop-release.yml`, which builds every target on its native runner.

## Publish

1. Tag a release (`git tag v0.1.0 && git push --tags`) — the workflow builds macOS
   (Intel + Apple Silicon), Windows, and Linux installers and attaches them to a
   **draft GitHub Release**.
2. **macOS distribution requires signing + notarization** (Apple Developer ID, $99/yr).
   Add the `APPLE_*` repo secrets listed in the workflow; until then, builds are
   unsigned and Gatekeeper will warn on other Macs.
3. Windows needs an Authenticode cert to avoid SmartScreen warnings.

## Regenerate icons

```bash
node scripts/gen-icon.mjs                     # writes src-tauri/icons/source.png
npx tauri icon src-tauri/icons/source.png     # emits all platform sizes (.icns/.ico/PNG)
```

Replace `scripts/gen-icon.mjs`'s placeholder mark with the real brand art when ready.
