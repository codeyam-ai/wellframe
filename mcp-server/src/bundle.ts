// Helpers for the .mcpb build pipeline (scripts/pack.sh, scripts/sign.sh,
// scripts/smoke.mjs, scripts/verify-signature.mjs). These live here rather than
// inline in the scripts because both are parsers whose failure mode is silent:
// a wrong offset or a stale regex yields plausible-looking output that only
// surfaces later as a confusing verification failure.

// mcpb appends a signature as:
//   "MCPB_SIG_V1" + uint32le(length) + DER PKCS#7 + "MCPB_SIG_END"
// Parsed here rather than imported from @anthropic-ai/mcpb, whose exports map
// does not expose the helper — and so a bundle can be checked on a machine with
// no mcpb installed.
const SIG_HEADER = Buffer.from('MCPB_SIG_V1', 'utf8');
const SIG_FOOTER = Buffer.from('MCPB_SIG_END', 'utf8');

export interface SignatureBlock {
  /** The archive bytes the signature covers — everything before the block. */
  originalContent: Buffer;
  /** The DER PKCS#7 signature, or undefined when the file is unsigned. */
  pkcs7Signature?: Buffer;
}

// Split a .mcpb into the signed payload and its signature block. An unsigned
// file — or one whose block is malformed — yields the whole file as content
// with no signature, so callers report "unsigned" rather than verifying a
// truncated payload and blaming the certificate.
export function extractSignatureBlock(file: Buffer): SignatureBlock {
  const footer = file.lastIndexOf(SIG_FOOTER);
  if (footer === -1) return { originalContent: file };

  // Search backwards: the archive payload may itself contain these bytes.
  const header = file.lastIndexOf(SIG_HEADER, footer);
  if (header === -1) return { originalContent: file };

  const lengthAt = header + SIG_HEADER.length;
  if (lengthAt + 4 > footer) return { originalContent: file };

  const sigLength = file.readUInt32LE(lengthAt);
  // The declared length must land exactly on the footer; anything else means a
  // corrupt or truncated block, and subarray would silently clamp it short.
  if (lengthAt + 4 + sigLength !== footer) return { originalContent: file };

  return {
    originalContent: file.subarray(0, header),
    pkcs7Signature: file.subarray(lengthAt + 4, footer),
  };
}

// Pull the desktop app's table definitions out of its Rust source so the smoke
// test's fixture database cannot drift from the schema Wellframe actually
// writes. Throws rather than returning empty: a silent miss would build the
// fixture with no tables and fail every tool for the wrong reason.
export function desktopSchemaFrom(source: string): string {
  const match = source.match(/const SCHEMA: &str = "([\s\S]*?)";/);
  if (!match) {
    throw new Error(
      'could not find `const SCHEMA: &str = "…"` in the desktop source — ' +
        'it was renamed or reformatted, so the smoke fixture cannot be built.',
    );
  }
  return match[1];
}
