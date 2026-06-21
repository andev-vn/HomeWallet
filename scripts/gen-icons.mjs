// Sinh icon PWA từ SVG -> PNG (192, 512) + apple-icon (180) + favicon.
// Chạy: node scripts/gen-icons.mjs
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(require('node:path').join(dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', '.pnpm', 'sharp@0.34.5', 'node_modules', 'sharp'));

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const appDir = join(root, 'src', 'app');

// Logo: nền gradient cam (brand) + biểu tượng ví/nhà đơn giản, bo góc.
const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f97316"/>
      <stop offset="1" stop-color="#9d4300"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <!-- mái nhà -->
  <path d="M256 120 L392 232 H120 Z" fill="#fff" opacity="0.95"/>
  <!-- thân ví -->
  <rect x="136" y="232" width="240" height="160" rx="28" fill="#fff"/>
  <rect x="296" y="288" width="96" height="56" rx="16" fill="#ffdbca"/>
  <circle cx="328" cy="316" r="14" fill="#9d4300"/>
</svg>`;

async function png(size) {
  return sharp(Buffer.from(svg(size))).resize(size, size).png().toBuffer();
}

const out = [
  [join(pub, 'icon-192.png'), 192],
  [join(pub, 'icon-512.png'), 512],
  [join(appDir, 'apple-icon.png'), 180],
];

for (const [path, size] of out) {
  writeFileSync(path, await png(size));
  console.log('wrote', path);
}

// favicon.ico (32) — ghi vào src/app để Next nhận diện
const ico = await sharp(Buffer.from(svg(32))).resize(32, 32).png().toBuffer();
writeFileSync(join(appDir, 'icon.png'), ico);
console.log('wrote', join(appDir, 'icon.png'));
