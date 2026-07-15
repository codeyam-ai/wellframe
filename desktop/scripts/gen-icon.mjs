// Dependency-free 1024×1024 PNG generator for a placeholder app icon.
// Draws the Wellframe deep-ink mark: dark field, concentric rounded frame in a
// quiet slate accent. `tauri icon` consumes this to emit every platform size.
import zlib from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const S = 1024;
const buf = Buffer.alloc(S * S * 4);

const INK = [10, 11, 13];
const FRAME = [159, 180, 199];
const SURFACE = [17, 19, 23];

function px(x, y, [r, g, b]) {
  const i = (y * S + x) * 4;
  buf[i] = r;
  buf[i + 1] = g;
  buf[i + 2] = b;
  buf[i + 3] = 255;
}

// Rounded-square membership test.
function inRounded(x, y, cx, cy, half, radius) {
  const dx = Math.abs(x - cx) - (half - radius);
  const dy = Math.abs(y - cy) - (half - radius);
  if (dx <= 0 || dy <= 0) return Math.abs(x - cx) <= half && Math.abs(y - cy) <= half;
  return dx * dx + dy * dy <= radius * radius;
}

const c = S / 2;
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    let color = INK;
    if (inRounded(x, y, c, c, 360, 120)) color = FRAME;
    if (inRounded(x, y, c, c, 320, 100)) color = SURFACE;
    px(x, y, color);
  }
}

// Encode raw RGBA scanlines (filter byte 0 per row) → zlib → PNG chunks.
const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  buf.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}
const idat = zlib.deflateSync(raw, { level: 9 });

const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c2 = n;
    for (let k = 0; k < 8; k++) c2 = c2 & 1 ? 0xedb88320 ^ (c2 >>> 1) : c2 >>> 1;
    t[n] = c2 >>> 0;
  }
  return t;
})();
function crc32(b) {
  let c2 = 0xffffffff;
  for (let i = 0; i < b.length; i++) c2 = crcTable[(c2 ^ b[i]) & 0xff] ^ (c2 >>> 8);
  return (c2 ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type RGBA
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

mkdirSync(new URL('../src-tauri/icons/', import.meta.url), { recursive: true });
const out = new URL('../src-tauri/icons/source.png', import.meta.url);
writeFileSync(out, png);
console.log('wrote', out.pathname, png.length, 'bytes');
