#!/usr/bin/env bash
# Pack the Wellframe Coach MCP server into an installable .mcpb.
#
# Packs from a STAGED tree rather than the working directory, so the bundle
# contains exactly what the server needs at runtime and never a dev artifact:
# `mcpb pack .` in place would sweep in TypeScript, the mcpb CLI itself, and
# every sql.js build variant (~50MB unpacked). Staging also means the dev tree
# is never mutated — no `npm ci --omit=dev` that wipes the dev dependencies you
# are still building against.
#
# Usage: npm run pack        (from mcp-server/)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGE="$ROOT/build/stage"
OUT="$ROOT/build/wellframe-coach.mcpb"

cd "$ROOT"

echo "→ compiling TypeScript"
npm run --silent build

echo "→ staging runtime tree"
rm -rf "$STAGE"
mkdir -p "$STAGE"
# package.json carries "type": "module" — dist/*.js are ESM and will not load
# without it. manifest.json is what makes the archive an MCPB.
cp package.json package-lock.json manifest.json README.md "$STAGE/"
cp -r dist "$STAGE/dist"
# Sourcemaps are a build-time artifact, not runtime. (Tests are not compiled
# into dist at all — tsconfig excludes them.)
find "$STAGE/dist" -name '*.map' -delete

echo "→ installing production dependencies"
(cd "$STAGE" && npm ci --omit=dev --silent --no-audit --no-fund)

# db.ts loads WASM via locateFile(dist/sql-wasm.wasm). The asm.js, browser, and
# debug builds are never reached from Node — dropping them takes sql.js from
# ~19MB to well under 1MB. Keep this list in sync with that locateFile call.
echo "→ pruning unused sql.js build variants"
SQLJS_DIST="$STAGE/node_modules/sql.js/dist"
find "$SQLJS_DIST" -type f \
  ! -name 'sql-wasm.js' \
  ! -name 'sql-wasm.wasm' \
  -delete

echo "→ packing"
mkdir -p "$(dirname "$OUT")"
npx --yes @anthropic-ai/mcpb pack "$STAGE" "$OUT"

echo
echo "Bundle: $OUT"
