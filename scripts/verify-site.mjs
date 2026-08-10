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
assert.match(index, /data-testid="brand-icon"|brand\/app-icon/i, 'landing: brand icon');
assert.match(index, /data-testid="app-showcase"|Inside Dustbound/i, 'landing: app showcase');
assert.match(index, /data-testid="sprite-constellation"|sprite-orb/i, 'landing: sprite constellation');
assert.match(index, /screenshots\/checklist|Track Collected/i, 'landing: checklist screenshot');
assert.match(index, /data-testid="upcoming"|Coming up/i, 'landing: upcoming roadmap');
assert.match(index, /data-icon="sprites"/i, 'landing: sprites upcoming icon');
assert.match(index, /data-icon="achievements"/i, 'landing: achievements upcoming icon');
assert.match(index, /data-icon="pairing"/i, 'landing: pairing upcoming icon');
assert.match(index, /data-testid="events-section"/i, 'landing: events section');
assert.match(index, /data-testid="events-list"|data-testid="events-empty"/i, 'landing: events list or empty');

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
assert.match(privacy, /data-testid="privacy-app"|<h2[^>]*>App<\/h2>/i, 'privacy: App section');
assert.match(privacy, /data-testid="privacy-website"|<h2[^>]*>Website<\/h2>/i, 'privacy: Website section');
assert.match(privacy, /Formspree/i, 'privacy: Formspree');
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
assert.match(support, /support@ingeniumsoftware\.dev/, 'support: email');
assert.match(support, /property="og:title"[^>]*content="Support · Dustbound"/i, 'support: og:title');

const cookies = read('cookies/index.html');
assertSingleChrome(cookies, 'cookies');
assert.equal(countTag(cookies, 'header'), 1, 'cookies: exactly one <header>');
assert.match(cookies, /does not set first-party cookies/i, 'cookies: no first-party');
assert.match(cookies, /does not use analytics/i, 'cookies: no analytics');

// Branding: no Fortnite/Override product marks on the landing (disclaimer may name Epic)
const hero = index.match(/data-testid="hero"[\s\S]*?<\/header>/i)?.[0] ?? '';
assert.doesNotMatch(hero, /Fortnite|Override/i, 'hero: no Fortnite/Override marks');
assert.doesNotMatch(index, /Fortnite|Override/i, 'landing: no Fortnite/Override marks (incl. Events)');
assert.match(index, /not affiliated with[\s\S]*Epic Games/i, 'landing: unofficial Epic disclaimer');

console.log('verify-site: ok');
