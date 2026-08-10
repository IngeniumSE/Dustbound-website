import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

function read(rel) {
  const full = path.join(dist, rel);
  assert.ok(fs.existsSync(full), `missing ${rel}`);
  return fs.readFileSync(full, 'utf8');
}

assert.ok(fs.existsSync(dist), 'dist/ missing — run npm run build first');

const index = read('index.html');
assert.match(index, /Coming soon/i, 'landing: Coming soon');
assert.match(index, /interest-form|formspree\.io\/f\/xaewepjp/i, 'landing: Formspree form');
assert.match(index, /name="_gotcha"/, 'landing: honeypot');
assert.match(index, /name="email"/, 'landing: email field');
assert.match(index, /unofficial fan companion/i, 'landing: unofficial disclaimer');
assert.match(index, /Trading or Indexing/i, 'landing: Trading or Indexing');
assert.match(index, /Pairing/i, 'landing: Pairing callout');
assert.match(index, /href="\/privacy\/"/, 'landing: privacy link');
assert.match(index, /href="\/support\/"/, 'landing: support link');
assert.match(index, /href="\/cookies\/"/, 'landing: cookies link');

const privacy = read('privacy/index.html');
assert.match(privacy, /data-testid="privacy-app"|<h2[^>]*>App<\/h2>/i, 'privacy: App section');
assert.match(privacy, /data-testid="privacy-website"|<h2[^>]*>Website<\/h2>/i, 'privacy: Website section');
assert.match(privacy, /Formspree/i, 'privacy: Formspree');
assert.match(privacy, /privacy@ingeniumsoftware\.dev/, 'privacy: contact');

const support = read('support/index.html');
assert.match(support, /support@ingeniumsoftware\.dev/, 'support: email');

const cookies = read('cookies/index.html');
assert.match(cookies, /does not set first-party cookies/i, 'cookies: no first-party');
assert.match(cookies, /does not use analytics/i, 'cookies: no analytics');

// Branding: no Fortnite/Override product marks in hero (disclaimer may name Epic for clarity)
const hero = index.match(/data-testid="hero"[\s\S]*?<\/header>/i)?.[0] ?? '';
assert.doesNotMatch(hero, /Fortnite|Override/i, 'hero: no Fortnite/Override marks');
assert.match(index, /not affiliated with[\s\S]*Epic Games/i, 'landing: unofficial Epic disclaimer');

console.log('verify-site: ok');
