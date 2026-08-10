#!/usr/bin/env node
/**
 * Built-site verification seam (#66): assert against dist/ after `astro build`.
 * Does not POST to Formspree.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
// Windows file URL pathname quirks
const distDir = process.platform === 'win32'
  ? join(process.cwd(), 'dist')
  : join(process.cwd(), 'dist');

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}
function ok(msg) {
  console.log('OK:', msg);
}

function readHtml(...parts) {
  const p = join(distDir, ...parts);
  if (!existsSync(p)) {
    fail(`missing ${p}`);
    return '';
  }
  return readFileSync(p, 'utf8');
}

if (!existsSync(distDir)) {
  fail(`dist/ not found — run npm run build first (${distDir})`);
  process.exit(1);
}

const home = readHtml('index.html');
const privacy = readHtml('privacy', 'index.html');
const support = readHtml('support', 'index.html');
const cookies = readHtml('cookies', 'index.html');

// Routes / links
for (const [name, html] of [
  ['home', home],
  ['privacy', privacy],
  ['support', support],
  ['cookies', cookies],
]) {
  if (!html) continue;
  ok(`${name} page built`);
}

if (home.includes('href="/privacy/"') && home.includes('href="/support/"') && home.includes('href="/cookies/"')) {
  ok('home links to legal routes');
} else {
  fail('home missing legal nav links');
}

// Landing signals
const landingNeedles = [
  'Coming soon',
  'Local checklist for Sprite collectibles',
  'one-time purchase, priced to stay low',
  'action="https://formspree.io/f/xaewepjp"',
  'name="email"',
  'name="_gotcha"',
  'Trading or Indexing',
  'Pairing',
  'not affiliated with, endorsed by, or connected to Epic Games',
];
for (const n of landingNeedles) {
  if (home.includes(n)) ok(`landing contains: ${n.slice(0, 48)}…`);
  else fail(`landing missing: ${n}`);
}

// Branding: no Fortnite in chrome titles/hero — soft check
if (/\bFortnite\b/i.test(home) || /\bOverride\b/.test(home)) {
  fail('landing appears to use Fortnite/Override branding');
} else {
  ok('landing avoids Fortnite/Override branding strings');
}

// Privacy sections
if (privacy.includes('data-section="app"') && privacy.includes('data-section="website"')) {
  ok('privacy has App and Website sections');
} else {
  fail('privacy missing App/Website section markers');
}
if (privacy.includes('Formspree') && privacy.includes('privacy@ingeniumsoftware.dev')) {
  ok('privacy discloses Formspree and privacy contact');
} else {
  fail('privacy missing Formspree or privacy contact');
}

// Support
if (support.includes('support@ingeniumsoftware.dev')) ok('support contact present');
else fail('support contact missing');

// Cookies claims
if (cookies.includes('data-claim="no-first-party-cookies"') && cookies.includes('data-claim="no-analytics"')) {
  ok('cookies page states no first-party cookies / no analytics');
} else {
  fail('cookies page missing claim markers');
}

if (process.exitCode) {
  console.error('\nVerification failed.');
  process.exit(1);
}
console.log('\nAll built-site checks passed.');
