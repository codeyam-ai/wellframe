// Verify the .mcpb's signature independently of `mcpb verify`.
//
// `mcpb verify` (2.1.2) reports EVERY bundle as unsigned: verifyMcpbFile calls
// node-forge's p7.verify(), which throws "PKCS#7 signature verification not yet
// implemented", and the catch turns that into status "unsigned" — and even past
// that, a self-signed certificate fails its OS-trust-store chain check. So the
// CLI cannot tell "signed with an untrusted cert" from "not signed at all".
//
// This checks the two things that actually matter: the signature block verifies
// cryptographically against our certificate, and the digest it covers is the
// digest of the exact bundle bytes (so the archive was not modified after
// signing). OpenSSL needs -binary; without it, S/MIME text canonicalization
// mangles the payload and verification fails misleadingly.
//
// Usage: node scripts/verify-signature.mjs [path/to/bundle.mcpb]

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractSignatureBlock } from '../dist/bundle.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bundle = process.argv[2] ?? path.join(ROOT, 'build', 'wellframe-coach.mcpb');
const cert = path.join(ROOT, '.signing', 'cert.pem');

const { originalContent, pkcs7Signature } = extractSignatureBlock(readFileSync(bundle));
if (!pkcs7Signature) {
  console.error(`FAIL: ${path.basename(bundle)} carries no signature block.`);
  process.exit(1);
}

const work = mkdtempSync(path.join(tmpdir(), 'wellframe-sig-'));
try {
  const sigDer = path.join(work, 'sig.der');
  const payload = path.join(work, 'payload.bin');
  writeFileSync(sigDer, pkcs7Signature);
  writeFileSync(payload, originalContent);

  execFileSync(
    'openssl',
    // prettier-ignore
    ['cms', '-verify', '-inform', 'DER', '-in', sigDer, '-content', payload, '-binary',
     '-certfile', cert, '-CAfile', cert, '-purpose', 'any', '-out', '/dev/null'],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );

  const cn = execFileSync('openssl', ['x509', '-in', cert, '-noout', '-subject'], {
    encoding: 'utf8',
  }).trim();
  const digest = createHash('sha256').update(originalContent).digest('hex');

  console.log(`  signature valid over ${originalContent.length} bytes`);
  console.log(`  payload sha256: ${digest}`);
  console.log(`  ${cn}`);
} catch (e) {
  console.error('FAIL: signature did not verify.');
  console.error(String(e.stderr ?? e.message).trim());
  process.exit(1);
} finally {
  rmSync(work, { recursive: true, force: true });
}
