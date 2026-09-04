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
assert.match(index, /Available now/i, 'landing: Available now');
assert.doesNotMatch(index, /Coming soon/i, 'landing: no Coming soon');
assert.doesNotMatch(index, /formspree\.io|interest-form|interest-signup/i, 'landing: signup form removed');
assert.doesNotMatch(index, /name="_gotcha"/, 'landing: no honeypot');
assert.match(index, /data-testid="store-badges"/, 'landing: store badges');
assert.match(index, /Get it on Google Play/, 'landing: Google Play badge');
assert.match(index, /Download on the App Store/, 'landing: App Store badge');
assert.match(index, /play\.google\.com\/store\/apps/, 'landing: Play Store URL');
assert.match(index, /apps\.apple\.com\/us\/app\/dustbound\/id6801057151/, 'landing: App Store URL');
assert.match(index, /producthunt\.com\/products\/dustbound/, 'landing: Product Hunt review badge');
assert.match(index, /href="\/#get-the-app"/, 'landing: Get the app nav');
assert.match(index, /data-store-pref/, 'landing: store platform detection');
assert.match(index, /unofficial fan companion/i, 'landing: unofficial disclaimer');
assert.match(index, /Trading or indexing/i, 'landing: Trading or indexing');
assert.match(index, /Pairing/i, 'landing: Pairing callout');
assert.match(index, /href="\/privacy\/"/, 'landing: privacy link');
assert.match(index, /href="\/support\/"/, 'landing: support link');
assert.match(index, /href="\/cookies\/"/, 'landing: cookies link');
assert.match(index, /data-testid="brand-icon"|brand\/app-icon/i, 'landing: brand icon');
assert.match(index, /data-testid="app-showcase"|What it does/i, 'landing: app showcase');
assert.match(index, /data-testid="sprite-constellation"|sprite-orb/i, 'landing: sprite constellation');
assert.match(index, /Track Collected/i, 'landing: checklist feature');
assert.match(index, /Trade & index|Pairing/i, 'landing: pairing feature');
assert.doesNotMatch(index, /Coming up/i, 'landing: Coming up removed');
assert.match(index, /data-testid="season-four"|New in Season 4/i, 'landing: Season 4');
assert.match(index, /Klombo|Storm Scout/i, 'landing: Season 4 sprites');
assert.match(
  index,
  /sprites\/c7s4\/klombo\/klombo\.f\.png/,
  'landing: Season 4 catalog base art',
);
assert.match(
  index,
  /sprites\/c7s4\/storm_scout\/storm_scout\.f\.png/,
  'landing: Storm Scout catalog art',
);
assert.match(index, /Lobby Hacks/i, 'landing: Lobby Hacks');
assert.match(index, /Override/i, 'landing: Override tab');
assert.doesNotMatch(index, /matthewabbottdev/i, 'landing: no Epic username');
assert.match(index, /data-testid="events-section"/i, 'landing: events section');
assert.match(index, /data-testid="events-list"|data-testid="events-empty"/i, 'landing: events list or empty');

const astroAssets = path.join(dist, '_astro');
assert.ok(fs.existsSync(astroAssets), 'events: dist/_astro missing');
const bundledJs = fs
  .readdirSync(astroAssets)
  .filter((name) => name.endsWith('.js'))
  .map((name) => fs.readFileSync(path.join(astroAssets, name), 'utf8'))
  .join('\n');
assert.match(
  bundledJs,
  /ingeniumse\.github\.io\/Dustbound-catalog\/v1\/catalog\.json/,
  'events: catalog feed URL',
);
assert.match(bundledJs, /sprites\//, 'events: catalog sprite art path');
assert.match(bundledJs, /\.f\.png/, 'events: featured sprite art suffix');

// Social / Open Graph + Twitter cards
assert.ok(fs.existsSync(path.join(dist, 'og.jpg')), 'social: og.jpg in dist');
assert.match(index, /property="og:title"/i, 'social: og:title');
assert.match(index, /property="og:description"/i, 'social: og:description');
assert.match(index, /property="og:url"/i, 'social: og:url');
assert.match(index, /property="og:image"[^>]*content="https:\/\/dustbound\.app\/og\.jpg"/i, 'social: og:image absolute');
assert.match(index, /property="og:image:width"[^>]*content="1200"/i, 'social: og:image:width');
assert.match(index, /property="og:image:height"[^>]*content="630"/i, 'social: og:image:height');
assert.match(index, /property="og:site_name"[^>]*content="Dustbound"/i, 'social: og:site_name');
assert.match(index, /name="twitter:card"[^>]*content="summary_large_image"/i, 'social: twitter:card');
assert.match(index, /name="twitter:image"[^>]*content="https:\/\/dustbound\.app\/og\.jpg"/i, 'social: twitter:image');

// SEO: crawlability, structured data, document title
assert.match(index, /<title>Dustbound — Offline Sprite Collectibles Checklist<\/title>/i, 'seo: document title');
assert.match(index, /name="robots"[^>]*content="index, follow/i, 'seo: robots meta');
assert.match(index, /rel="canonical"[^>]*href="https:\/\/dustbound\.app\/"/i, 'seo: canonical');
assert.match(index, /rel="sitemap"[^>]*href="\/sitemap-index\.xml"/i, 'seo: sitemap link');
assert.match(index, /application\/ld\+json/i, 'seo: JSON-LD');
assert.match(index, /"@type":"WebSite"/i, 'seo: WebSite schema');
assert.match(index, /"@type":"Organization"/i, 'seo: Organization schema');
assert.match(index, /"@type":"MobileApplication"/i, 'seo: MobileApplication schema');
assert.match(index, /id="main-content"/i, 'seo: main landmark id');
assert.match(index, /href="#main-content"/i, 'seo: skip link');
assert.ok(fs.existsSync(path.join(dist, 'robots.txt')), 'seo: robots.txt');
assert.match(read('robots.txt'), /Sitemap:\s*https:\/\/dustbound\.app\/sitemap-index\.xml/i, 'seo: robots sitemap');
assert.ok(
  fs.existsSync(path.join(dist, 'sitemap-index.xml')) || fs.existsSync(path.join(dist, 'sitemap-0.xml')),
  'seo: sitemap xml',
);
const sitemap = fs.existsSync(path.join(dist, 'sitemap-0.xml'))
  ? read('sitemap-0.xml')
  : read('sitemap-index.xml');
assert.match(sitemap, /https:\/\/dustbound\.app\//, 'seo: sitemap includes home');

function countTag(html, tag) {
  return (html.match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
}

function assertSingleChrome(html, label) {
  assert.equal(countTag(html, 'footer'), 1, `${label}: exactly one <footer>`);
  assert.equal(
    (html.match(/aria-label="Primary"/g) || []).length,
    1,
    `${label}: exactly one Primary nav`,
  );
}

assertSingleChrome(index, 'landing');

const privacy = read('privacy/index.html');
assertSingleChrome(privacy, 'privacy');
assert.equal(countTag(privacy, 'header'), 1, 'privacy: exactly one <header>');
assert.match(privacy, /data-testid="privacy-app"|In short/i, 'privacy: summary');
assert.match(privacy, /data-testid="privacy-pairing"|Pairing/i, 'privacy: Pairing section');
assert.match(privacy, /Epic username/i, 'privacy: Epic username');
assert.match(privacy, /data-testid="privacy-website"|This website/i, 'privacy: Website section');
assert.match(privacy, /no signup list or newsletter/i, 'privacy: no signup list');
assert.match(privacy, /Formspree/i, 'privacy: Formspree named for Support');
assert.match(privacy, /href="\/support\/"/, 'privacy: Support link');
assert.match(privacy, /privacy@ingeniumsoftware\.dev/, 'privacy: contact');
assert.equal(
  (privacy.match(/unofficial fan companion/gi) || []).length,
  1,
  'privacy: disclaimer only in site footer (not repeated in body)',
);

assert.match(privacy, /property="og:title"[^>]*content="Privacy · Dustbound"/i, 'privacy: og:title');

const support = read('support/index.html');
assertSingleChrome(support, 'support');
assert.equal(countTag(support, 'header'), 1, 'support: exactly one <header>');
assert.match(support, /formspree\.io\/f\/xaewepjp/, 'support: Formspree endpoint');
assert.match(support, /data-testid="support-form"/, 'support: form');
assert.match(support, /name="email"/, 'support: email field');
assert.match(support, /name="message"/, 'support: message field');
assert.match(support, /name="_gotcha"/, 'support: honeypot');
assert.match(support, /support@ingeniumsoftware\.dev/, 'support: email fallback');
assert.match(support, /property="og:title"[^>]*content="Support · Dustbound"/i, 'support: og:title');

const cookies = read('cookies/index.html');
assertSingleChrome(cookies, 'cookies');
assert.equal(countTag(cookies, 'header'), 1, 'cookies: exactly one <header>');
assert.match(cookies, /does not set first-party cookies/i, 'cookies: no first-party');
assert.match(cookies, /does not use analytics/i, 'cookies: no analytics');

// Branding: no Fortnite/Override product marks on the landing (disclaimer may name Epic)
const hero = index.match(/data-testid="hero"[\s\S]*?<\/header>/i)?.[0] ?? '';
assert.doesNotMatch(hero, /Fortnite|Override/i, 'hero: no Fortnite/Override marks');
assert.doesNotMatch(index, /Fortnite/i, 'landing: no Fortnite marks (incl. Events)');
assert.match(index, /not affiliated with[\s\S]*Epic Games/i, 'landing: unofficial Epic disclaimer');

const help = read('help/index.html');
assertSingleChrome(help, 'help');
assert.equal(countTag(help, 'header'), 1, 'help: exactly one <header>');
assert.match(help, /<title>Help request · Dustbound<\/title>/i, 'help: document title');
assert.match(help, /property="og:title"[^>]*content="Help request · Dustbound"/i, 'help: og:title');
assert.match(help, /Open in Dustbound/, 'help: Open in Dustbound');
assert.match(help, /Help request/, 'help: Help request');
assert.match(help, /play\.google\.com\/store\/apps/, 'help: Play Store URL');
assert.match(help, /apps\.apple\.com\/us\/app\/dustbound\/id6801057151/, 'help: App Store URL');
assert.match(help, /Get it on Google Play/, 'help: Google Play badge');
assert.match(help, /Download on the App Store/, 'help: App Store badge');
assert.doesNotMatch(help, /Coming soon/i, 'help: no Coming soon');
assert.match(help, /name="robots"[^>]*content="[^"]*noindex/i, 'help: robots noindex');
assert.doesNotMatch(help, /pairing-api|workers\.dev/i, 'help: no pairing-api host');
assert.doesNotMatch(help, /Reputation/, 'help: no Reputation');
assert.doesNotMatch(help, /Fortnite|Override/i, 'help: no Fortnite/Override marks');
assert.match(help, /not affiliated with[\s\S]*Epic Games/i, 'help: unofficial Epic disclaimer');

const assetlinks = read('.well-known/assetlinks.json');
assert.match(assetlinks, /dev\.ingeniumsoftware\.dustbound/, 'assetlinks: package');
const aasa = read('.well-known/apple-app-site-association');
assert.match(aasa, /\/help/, 'aasa: /help');

assert.doesNotMatch(sitemap, /https:\/\/dustbound\.app\/help\/?/, 'seo: sitemap excludes /help/');

console.log('verify-site: ok');
