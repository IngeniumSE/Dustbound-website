import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;
const outPath = path.join(root, 'public', 'og.jpg');

const bg = await sharp(path.join(root, 'src/assets/garden_pond_bg.jpg'))
  .resize(W, H, { fit: 'cover', position: 'top' })
  .modulate({ brightness: 0.55, saturation: 1.05 })
  .toBuffer();

const iconSize = 280;
const icon = await sharp(path.join(root, 'src/assets/brand/app-icon.png'))
  .resize(iconSize, iconSize, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a1a14" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="#0a1a14" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#0a1a14" stop-opacity="0.92"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00d8f0"/>
      <stop offset="100%" stop-color="#7cff5a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>
  <rect x="0" y="0" width="8" height="${H}" fill="url(#accent)"/>
  <text x="360" y="285" font-family="Segoe UI, ui-sans-serif, system-ui, sans-serif" font-size="84" font-weight="900" fill="#f7fffc">Dustbound</text>
  <text x="360" y="350" font-family="Segoe UI, ui-sans-serif, system-ui, sans-serif" font-size="30" font-weight="600" fill="#a8c8c0">Local checklist for Sprite collectibles</text>
  <text x="360" y="395" font-family="Segoe UI, ui-sans-serif, system-ui, sans-serif" font-size="24" font-weight="600" fill="#00d8f0">Coming soon · Android</text>
</svg>`);

await sharp(bg)
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: icon, top: Math.round((H - iconSize) / 2), left: 56 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(outPath);

const meta = await sharp(outPath).metadata();
const { size } = fs.statSync(outPath);
console.log(`wrote ${path.relative(root, outPath)} ${meta.width}x${meta.height} (${size} bytes)`);
