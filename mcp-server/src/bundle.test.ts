import { describe, it, expect } from 'vitest';
import { extractSignatureBlock, desktopSchemaFrom } from './bundle.js';

// Build a signature block in mcpb's on-disk format, so the tests exercise the
// real layout rather than whatever the parser happens to accept.
function signed(payload: Buffer, signature: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32LE(signature.length, 0);
  return Buffer.concat([
    payload,
    Buffer.from('MCPB_SIG_V1', 'utf8'),
    len,
    signature,
    Buffer.from('MCPB_SIG_END', 'utf8'),
  ]);
}

describe('extractSignatureBlock', () => {
  // The happy path: the payload must be returned byte-exact, because the
  // signature is verified against its digest — one extra or missing byte and a
  // valid signature reads as a forgery.
  it('splits a signed bundle into payload and signature', () => {
    const payload = Buffer.from('PK\x03\x04 archive bytes');
    const sig = Buffer.from('der-signature-bytes');
    const { originalContent, pkcs7Signature } = extractSignatureBlock(signed(payload, sig));
    expect(originalContent).toEqual(payload);
    expect(pkcs7Signature).toEqual(sig);
  });

  // An unsigned bundle is the common case (fresh `mcpb pack` output); it must
  // report no signature rather than throwing.
  it('reports no signature for an unsigned bundle', () => {
    const file = Buffer.from('PK\x03\x04 just an archive');
    const { originalContent, pkcs7Signature } = extractSignatureBlock(file);
    expect(pkcs7Signature).toBeUndefined();
    expect(originalContent).toEqual(file);
  });

  // A zip payload can contain the footer bytes by coincidence. Without the
  // header check that would be parsed as a malformed signature.
  it('ignores a footer that has no matching header', () => {
    const file = Buffer.concat([Buffer.from('archive'), Buffer.from('MCPB_SIG_END', 'utf8')]);
    expect(extractSignatureBlock(file).pkcs7Signature).toBeUndefined();
  });

  // A truncated block would otherwise yield a short signature via subarray's
  // silent clamping — verification would then fail and wrongly implicate the
  // certificate instead of the corrupt file.
  it('rejects a block whose declared length does not reach the footer', () => {
    const payload = Buffer.from('archive');
    const sig = Buffer.from('0123456789');
    const file = signed(payload, sig);
    // Overstate the signature length by one byte.
    file.writeUInt32LE(sig.length + 1, payload.length + 'MCPB_SIG_V1'.length);
    expect(extractSignatureBlock(file).pkcs7Signature).toBeUndefined();
  });

  // Re-signing appends a second block; the last one is the live signature and
  // the earlier block is part of what it covers.
  it('uses the last signature block when a bundle was signed twice', () => {
    const inner = signed(Buffer.from('archive'), Buffer.from('old-sig'));
    const outer = signed(inner, Buffer.from('new-sig'));
    const { originalContent, pkcs7Signature } = extractSignatureBlock(outer);
    expect(pkcs7Signature).toEqual(Buffer.from('new-sig'));
    expect(originalContent).toEqual(inner);
  });

  // Guards the empty-input edge rather than letting readUInt32LE throw a
  // range error out of a build script.
  it('handles an empty buffer', () => {
    const { originalContent, pkcs7Signature } = extractSignatureBlock(Buffer.alloc(0));
    expect(pkcs7Signature).toBeUndefined();
    expect(originalContent.length).toBe(0);
  });
});

describe('desktopSchemaFrom', () => {
  // The extracted text is executed as SQL to build the fixture, so every
  // statement between the quotes must survive intact.
  it('extracts the schema between the Rust string delimiters', () => {
    const src = [
      'fn main() {}',
      'const SCHEMA: &str = "',
      'CREATE TABLE IF NOT EXISTS workout (id INTEGER PRIMARY KEY);',
      'CREATE TABLE IF NOT EXISTS goal (id INTEGER PRIMARY KEY);',
      '";',
      'fn other() {}',
    ].join('\n');
    const schema = desktopSchemaFrom(src);
    expect(schema).toMatch(/CREATE TABLE IF NOT EXISTS workout/);
    expect(schema).toMatch(/CREATE TABLE IF NOT EXISTS goal/);
    expect(schema).not.toMatch(/fn main|fn other/);
  });

  // Non-greedy matching: a later string literal must not be swallowed into the
  // schema, which would feed invalid SQL to the fixture builder.
  it('stops at the first closing delimiter', () => {
    const src = 'const SCHEMA: &str = "CREATE TABLE a (id INT);";\nconst OTHER: &str = "not schema";';
    expect(desktopSchemaFrom(src)).toBe('CREATE TABLE a (id INT);');
  });

  // The failure that matters: if the const is renamed, the fixture would
  // otherwise be built with no tables and every tool would fail confusingly.
  it('throws a named error when the schema constant is absent', () => {
    expect(() => desktopSchemaFrom('fn main() {}')).toThrow(
      /could not find[\s\S]*SCHEMA[\s\S]*desktop source/,
    );
  });
});
