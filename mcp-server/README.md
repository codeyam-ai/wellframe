# Wellframe Coach — MCP server

An [MCP](https://modelcontextprotocol.io) server that gives an AI coach **read-only,
local** access to your Wellframe health data. It reads the same SQLite database the
Wellframe desktop app writes (`wellframe.db` in your OS app-data dir) and exposes the
coach's structured tools — so any MCP host (e.g. Claude Desktop) can reason over your
real history. **Nothing is uploaded**; the server only reads local SQLite.

Storage is read via **sql.js (WASM)**, so the packaged `.mcpb` is a single portable
bundle with no native module to compile per-OS.

## Tools

| Tool | What it returns |
|---|---|
| `get_readiness` | Today's readiness score, label, verdict, coach note |
| `list_workouts` | Recent workouts (limit) |
| `analyze_sleep` | Nightly sleep-quality ratings + sleep trend series |
| `compute_training_load` | Training-load trend + workout counts by type |
| `recommend_recovery` | Recovery score, contributing factors, suggested actions |
| `list_goals` | Goals with progress toward each target |
| `recent_checkins` | Recent check-ins (energy/mood/sleep/soreness/stress + notes) |

## Develop

```bash
npm install
npm run build
# point it at a database and run over stdio:
WELLFRAME_DB=/path/to/wellframe.db node dist/index.js
```

If `WELLFRAME_DB` is unset it defaults to the desktop app's location for your OS
(e.g. macOS `~/Library/Application Support/com.wellframe.desktop/wellframe.db`).

## Package as a `.mcpb`

```bash
npm run pack          # tsc + mcpb pack . dist/wellframe-coach.mcpb
npm run validate      # validate the manifest against the mcpb schema
```

Install the resulting `.mcpb` by double-clicking it (Claude Desktop) or dragging it
into the host's Settings. To publish: distribute the file, or submit it to the
extension directory. Signing is optional (`npx @anthropic-ai/mcpb sign`).

> For the smallest bundle, prune dev dependencies before packing:
> `npm ci --omit=dev && npx @anthropic-ai/mcpb pack . dist/wellframe-coach.mcpb`
> (then reinstall dev deps to keep building).
