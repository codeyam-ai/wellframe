#!/usr/bin/env bash
# Self-sign the packed .mcpb with a stable local code-signing certificate.
#
# Why not `mcpb sign --self-signed`: that flag ignores --cert/--key and writes
# the certificate into node_modules/@anthropic-ai/mcpb/dist/, which is wiped on
# every reinstall — so the bundle's signing identity silently changes each time.
# Keeping the cert in .signing/ (gitignored) means the identity is stable across
# rebuilds. The key never leaves this machine and is never committed.
#
# Usage: npm run sign

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SIGNING="$ROOT/.signing"
BUNDLE="${1:-$ROOT/build/wellframe-coach.mcpb}"

cd "$ROOT"

if [[ ! -f "$BUNDLE" ]]; then
  echo "ERROR: no bundle at $BUNDLE — run 'npm run pack' first." >&2
  exit 1
fi

if [[ ! -f "$SIGNING/cert.pem" || ! -f "$SIGNING/key.pem" ]]; then
  echo "→ creating code-signing certificate (10 years, codeSigning EKU)"
  mkdir -p "$SIGNING"
  cat > "$SIGNING/openssl.cnf" <<'CONF'
[req]
distinguished_name = dn
x509_extensions = v3
prompt = no
[dn]
CN = Wellframe Coach (self-signed)
O  = Wellframe
[v3]
basicConstraints = critical,CA:FALSE
keyUsage = critical,digitalSignature
extendedKeyUsage = critical,codeSigning
subjectKeyIdentifier = hash
CONF
  openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
    -config "$SIGNING/openssl.cnf" \
    -keyout "$SIGNING/key.pem" -out "$SIGNING/cert.pem" 2>/dev/null
  chmod 600 "$SIGNING/key.pem"
else
  echo "→ using existing certificate in .signing/"
fi

# Re-signing an already-signed bundle would sign the previous signature block
# along with the payload, so strip any existing signature first.
npx --yes @anthropic-ai/mcpb unsign "$BUNDLE" >/dev/null 2>&1 || true

echo "→ signing"
npx --yes @anthropic-ai/mcpb sign "$BUNDLE" --cert "$SIGNING/cert.pem" --key "$SIGNING/key.pem"

# `mcpb verify` cannot confirm this (see README) — it reports every bundle as
# unsigned in 2.1.2 — so check the signature ourselves against the cert.
echo "→ verifying signature"
node "$ROOT/scripts/verify-signature.mjs" "$BUNDLE"
