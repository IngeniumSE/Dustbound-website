/**
 * Compose App Store / Play listing frames from real Dustbound screenshots.
 *
 *   node scripts/generate-store-listings.mjs
 *
 * Writes:
 *   store-listings/iphone-67/*.png  (1290×2796)
 *   store-listings/play/*.png       (1080×1920)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const shots = path.join(root, 'src/assets/screenshots');
const gardenPath = path.join(root, 'src/assets/garden_pond_bg.jpg');

const listings = [
  {
    file: '01-track-every-sprite',
    shot: 'collection.png',
    tone: 'garden',
    kicker: 'DUSTBOUND',
    line1: 'TRACK EVERY',
    line2: 'SPRITE',
    sub: 'Check off Collected &amp; Mastered',
  },
  {
    file: '02-pair-trade-index',
    shot: 'pairing.png',
    tone: 'deep',
    kicker: 'PAIRING',
    line1: 'TRADE &amp; INDEX',
    line2: 'SPRITES',
    sub: 'Help each other obtain Collectibles',
  },
  {
    file: '03-meet-in-the-game',
    shot: 'pairing-trade.png',
    tone: 'garden',
    kicker: 'PAIRING',
    line1: 'MEET UP IN',
    line2: 'THE GAME',
    sub: 'Epic usernames after you both confirm',
  },
  {
    file: '04-earn-as-you-collect',
    shot: 'achievements.png',
    tone: 'deep',
    kicker: 'DUSTBOUND',
    line1: 'EARN AS YOU',
    line2: 'COLLECT',
    sub: 'Achievements for collecting, mastering &amp; Pairing',
  },
];

const sizes = {
  'iphone-67': { w: 1290, h: 2796 },
  play: { w: 1080, h: 1920 },
};

function overlaySvg({ w, h, kicker, line1, line2, sub, tone }) {
  const titleSize = Math.round(w * 0.118);
  const kickerSize = Math.round(w * 0.032);
  const subSize = Math.round(w * 0.038);
  const titleY = Math.round(h * 0.072);
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a1a14" stop-opacity="${tone === 'garden' ? '0.42' : '0.22'}"/>
      <stop offset="38%" stop-color="#0a1a14" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#06120e" stop-opacity="0.92"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="62%" r="48%">
      <stop offset="0%" stop-color="#00d8f0" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="#00d8f0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#veil)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <text x="${w / 2}" y="${titleY}" text-anchor="middle"
    font-family="Segoe UI, ui-sans-serif, system-ui, sans-serif"
    font-size="${kickerSize}" font-weight="700" letter-spacing="8" fill="#00d8f0">${kicker}</text>
  <text x="${w / 2}" y="${titleY + titleSize * 0.95}" text-anchor="middle"
    font-family="Segoe UI, ui-sans-serif, system-ui, sans-serif"
    font-size="${titleSize}" font-weight="900" fill="#f7fffc">${line1}</text>
  <text x="${w / 2}" y="${titleY + titleSize * 1.85}" text-anchor="middle"
    font-family="Segoe UI, ui-sans-serif, system-ui, sans-serif"
    font-size="${titleSize}" font-weight="900" fill="#f7fffc">${line2}</text>
  <text x="${w / 2}" y="${titleY + titleSize * 2.2}" text-anchor="middle"
    font-family="Segoe UI, ui-sans-serif, system-ui, sans-serif"
    font-size="${subSize}" font-weight="600" fill="#a8c8c0">${sub}</text>
</svg>`);
}

async function phonePlate(shotPath, frameW) {
  const radius = Math.round(frameW * 0.09);
  const pad = Math.round(frameW * 0.035);
  const innerW = frameW - pad * 2;
  const meta = await sharp(shotPath).metadata();
  const innerH = Math.round(innerW * (meta.height / meta.width));
  const frameH = innerH + pad * 2;

  const screen = await sharp(shotPath)
    .resize(innerW, innerH)
    .png()
    .toBuffer();

  const rounded = await sharp(screen)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${innerW}" height="${innerH}"><rect x="0" y="0" width="${innerW}" height="${innerH}" rx="${Math.round(radius * 0.72)}" ry="${Math.round(radius * 0.72)}" fill="white"/></svg>`,
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  const bezel = await sharp({
    create: {
      width: frameW,
      height: frameH,
      channels: 4,
      background: { r: 10, g: 22, b: 18, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${frameW}" height="${frameH}">
            <defs>
              <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3a6a5c"/>
                <stop offset="40%" stop-color="#122820"/>
                <stop offset="100%" stop-color="#06120e"/>
              </linearGradient>
            </defs>
            <rect x="1" y="1" width="${frameW - 2}" height="${frameH - 2}" rx="${radius}" ry="${radius}" fill="url(#b)" stroke="#00d8f0" stroke-opacity="0.45" stroke-width="3"/>
          </svg>`,
        ),
        left: 0,
        top: 0,
      },
      { input: rounded, left: pad, top: pad },
    ])
    .png()
    .toBuffer();

  return { bezel, frameW, frameH };
}

async function composeSize(dirName, w, h) {
  const outDir = path.join(root, 'store-listings', dirName);
  fs.mkdirSync(outDir, { recursive: true });

  const garden = await sharp(gardenPath)
    .resize(w, h, { fit: 'cover', position: 'top' })
    .modulate({ brightness: 0.45, saturation: 1.08 })
    .toBuffer();

  const deep = await sharp({
    create: { width: w, height: h, channels: 3, background: { r: 6, g: 18, b: 14 } },
  })
    .png()
    .toBuffer();

  const phoneTop = Math.round(h * 0.285);
  const bottomPad = Math.round(h * 0.045);
  const maxFrameH = h - phoneTop - bottomPad;
  const padGuess = Math.round(w * 0.025);
  const maxInnerH = maxFrameH - padGuess * 2;
  const phoneW = Math.min(Math.round(w * 0.7), Math.round(maxInnerH * (1080 / 2400) + padGuess * 2));

  for (const item of listings) {
    const base = item.tone === 'garden' ? garden : deep;
    const { bezel, frameW, frameH } = await phonePlate(path.join(shots, item.shot), phoneW);
    const phoneLeft = Math.round((w - frameW) / 2);
    const dest = path.join(outDir, `${item.file}.png`);

    await sharp(base)
      .composite([
        { input: overlaySvg({ w, h, ...item }), left: 0, top: 0 },
        { input: bezel, left: phoneLeft, top: phoneTop },
      ])
      .png({ compressionLevel: 9 })
      .toFile(dest);

    const { size } = fs.statSync(dest);
    console.log(`wrote ${path.relative(root, dest)} ${w}x${h} (${size} bytes)`);
  }
}

for (const [name, { w, h }] of Object.entries(sizes)) {
  await composeSize(name, w, h);
}
