// Dependency-free PNG icon generator for the PWA.
// Draws a rounded-square brand tile with a stylized "P" check mark and writes
// the required icon sizes into /public/icons. Run with: node scripts/generate-icons.mjs
import { promises as fs } from "fs";
import path from "path";
import zlib from "zlib";

const OUT_DIR = path.join(process.cwd(), "public", "icons");

// Brand colors (RGB)
const BG_TOP = [37, 99, 235]; // #2563eb
const BG_BOT = [29, 78, 216]; // #1d4ed8
const FG = [255, 255, 255];

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function makeImage(size, { maskable = false } = {}) {
  const px = new Uint8Array(size * size * 4);
  const radius = maskable ? size * 0.0 : size * 0.22; // maskable = full bleed
  const safe = maskable ? size * 0.1 : 0; // keep glyph within maskable safe zone

  const set = (x, y, [r, g, b], a = 255) => {
    const i = (y * size + x) * 4;
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = a;
  };

  const inRounded = (x, y) => {
    if (maskable) return true;
    const rx = Math.min(x, size - 1 - x);
    const ry = Math.min(y, size - 1 - y);
    if (rx >= radius || ry >= radius) return true;
    const dx = radius - rx;
    const dy = radius - ry;
    return dx * dx + dy * dy <= radius * radius;
  };

  // Background gradient + rounded corners
  for (let y = 0; y < size; y++) {
    const t = y / size;
    const col = [
      lerp(BG_TOP[0], BG_BOT[0], t),
      lerp(BG_TOP[1], BG_BOT[1], t),
      lerp(BG_TOP[2], BG_BOT[2], t),
    ];
    for (let x = 0; x < size; x++) {
      if (inRounded(x, y)) set(x, y, col, 255);
      else set(x, y, [0, 0, 0], 0);
    }
  }

  // Draw a bold "P" using rectangles, scaled to the canvas.
  const u = (size - safe * 2) / 100; // unit based on a 100x100 design grid
  const ox = safe;
  const oy = safe;
  const rect = (gx, gy, gw, gh, color = FG) => {
    const x0 = Math.round(ox + gx * u);
    const y0 = Math.round(oy + gy * u);
    const x1 = Math.round(ox + (gx + gw) * u);
    const y1 = Math.round(oy + (gy + gh) * u);
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++)
        if (x >= 0 && y >= 0 && x < size && y < size) set(x, y, color, 255);
  };
  // Vertical stem
  rect(34, 24, 12, 52);
  // Top bar of the bowl
  rect(34, 24, 28, 12);
  // Right side of the bowl
  rect(50, 24, 12, 30);
  // Bottom bar of the bowl
  rect(34, 42, 28, 12);

  return px;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1
    );
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

async function write(name, size, opts) {
  const rgba = makeImage(size, opts);
  const png = encodePng(size, rgba);
  await fs.writeFile(path.join(OUT_DIR, name), png);
  console.log("wrote", name, `${png.length} bytes`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await write("icon-192.png", 192);
  await write("icon-512.png", 512);
  await write("maskable-512.png", 512, { maskable: true });
  await write("apple-touch-icon.png", 180);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
