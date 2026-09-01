# Help landing `/help/`

Paste-ready GitHub issue for **IngeniumSE/Dustbound-website**.

**Suggested title:** Help landing `/help/`

**Suggested labels:** `enhancement`

Parent: [IngeniumSE/Dustbound#349](https://github.com/IngeniumSE/Dustbound/issues/349) stories **28**, **44–48** (app + pairing-api already shipping Help-code share & jump). ADR [0008](https://github.com/IngeniumSE/Dustbound/blob/main/docs/adr/0008-help-https-on-dustbound-app.md) (https Help on dustbound.app; reveal stays on the Worker). Glossary: Dustbound `CONTEXT.md` — **Help code**, **Help link**, **Help jump**, **Help request**, **Share**, **Open to Pairing**, **Display name**. Do not invent a second glossary here.

This repo is static Astro on GitHub Pages (`output: 'static'`, `trailingSlash: 'always'`, `site: https://dustbound.app`). There is no `/help/` page today. Pairing API must stay out of this issue.

---

## Problem Statement

Native Share sends `https://dustbound.app/help/?code=&collectible=&name=`. Chat apps blue-link that URL. Android 12+ with AutoVerify still off opens it in the browser. dustbound.app has no `/help/` folder, so that tap is a GitHub Pages 404 — not **Open in Dustbound**, not store badges, not Catalog art.

The Worker must not grow a public `GET /help/` (unmatched pairing-api paths stay JSON 404; reveal keeps `/pairing`). The marketing site already has Catalog, store chrome, and a real-folder pattern (`/privacy/`).

## Solution

Add a static `/help/` page like `/privacy/`. Client JS reads the unsigned query and paints a **Help request** preview. Valid Help code → dotted code + **Open in Dustbound** (`dustbound://help/{canonical}`). Catalog-known Collectible → Sprite art + Collectible name. Present `name` → Display name. Missing or junk query → store / coming-soon chrome only. Never call pairing-api. Never show Reputation.

Also publish App Link files on **this host** (`/.well-known/assetlinks.json` and `/.well-known/apple-app-site-association`) so Android/iOS can later AutoVerify / Universal-Link `/help` without touching Worker reveal.

## User Stories

1. As someone who taps a shared Help link without Dustbound installed, I want `https://dustbound.app/help/` to be a real page (not a 404), so that I can install or come back later.
2. As someone with Dustbound installed whose OS still opened the browser, I want **Open in Dustbound** to use `dustbound://help/{canonical}`, so that the app Help-jumps by Help code only.
3. As a Seeker’s friend, I want a valid `code` shown as the canonical dotted Help code under a **Help code** section, so that I can read the three words if the custom scheme fails.
4. As a Seeker’s friend, I want Catalog Sprite art and Collectible name when `collectible` is a known `{spriteSlug}:{variantCode}`, so that the page matches unmatched Details **A** art (cyan well, ~108 CSS px).
5. As a Seeker’s friend, I want the Seeker's Display name when `name` is present and non-blank, so that the preview matches the share payload.
6. As a Seeker’s friend, I never want Reputation on this page, so that the unsigned URL cannot pretend to carry a score.
7. As someone who opens `/help/` with missing or junk query, I want store / coming-soon chrome only — no fake miss, no implied occupancy — so that a guessed URL cannot look like a live Help.
8. As someone who opens a link whose `collectible` or `name` was edited, I still want **Open in Dustbound** to use only the parsed Help code, so that a liar preview cannot spoof the in-app deal.
9. As pairing-api, I want this site never to call `GET /v1/help-requests/by-code/…` (or any Worker host), so that by-code stays Bearer-gated and occupancy stays off the public web.
10. As Android, I want `/.well-known/assetlinks.json` on dustbound.app for package `dev.ingeniumsoftware.dustbound`, so that AutoVerify can be turned on in the app later.
11. As iOS, I want `/.well-known/apple-app-site-association` on dustbound.app with `/help` and `/help/*` and **no redirect**, so that Universal Links can claim Help https without claiming reveal.
12. As a crawler, I want `/help/` `noindex` and out of the sitemap, so that unbounded unsigned query URLs are not indexed.
13. As a tester, I want `npm test` (`astro build` + `scripts/verify-site.mjs`) to lock the static HTML and well-known files, so that this page is verified the same way as `/privacy/`.

## Implementation Decisions

### URL and query (locked by Dustbound Core `HelpLink`)

Share payload (already shipped in the app):

```text
https://dustbound.app/help/?code={canonical}&collectible={spriteSlug}:{variantCode}&name={displayName}
```

- Path is `/help` or `/help/` (site `trailingSlash: 'always'` → implement as `src/pages/help/index.astro` → `https://dustbound.app/help/`).
- Query names: `code`, `collectible`, `name` (case-insensitive keys). Values URI-decoded.
- `collectible` = `{spriteSlug}:{variantCode}` (Catalog id, e.g. `water:Base`).
- `name` = Display name (occupancy handle, not a lookup key).
- No Reputation. No Help request id. No Worker host.
- **Open in Dustbound** href: `dustbound://help/{canonical}` — Help code only. Do not put `collectible` or `name` on the custom-scheme URL.

### Help code parse

Same rules as Dustbound `HelpCodeGenerator.TryParse`:

- Three tokens, order matters.
- Case-insensitive; separators `.` / space / `-`; empty tokens dropped.
- Each token must be in the matching bank (adjective / middle / noun). Unknown word rejects. No fuzzy match.
- Canonical display and custom-scheme path: `quiet.tide.otter`.

Port the three banks into this repo (e.g. `src/lib/help-code.ts`) with a comment pointing at `Dustbound.Core` `HelpCodeGenerator`. Do not fetch banks from pairing-api. If Core banks change, update this copy.

**Valid `code`:** show **Help code** + **Open in Dustbound**.

**Missing or unparseable `code`:** badges / coming-soon only. Do not show a Help code, do not emit a `dustbound://help/…` link, do not say the Help is gone or unknown.

### Preview (unsigned, display-only)

Hydrate **in the browser** from `window.location.search`. GitHub Pages cannot per-query OG at crawl time.

| Query | Page shows |
|---|---|
| Valid `code` | Canonical dotted code; **Open in Dustbound** |
| `collectible` found in Catalog | Collectible title from Catalog (Sprite `name`; include variant when not `Base`) + Sprite art |
| `collectible` missing or unknown | Skip art; do not invent a Collectible; still show code/CTA if `code` parsed |
| Non-blank `name` | Display name as given (trim); do not validate |
| Anything else | Store / coming-soon chrome only |

If Catalog fetch fails, still show a valid Help code + **Open in Dustbound**; skip art.

Unsigned `collectible` / `name` may lie. Copy must not claim the deal is verified.

### Catalog art

Public Catalog (same host the landing Events feed already uses):

```text
https://ingeniumse.github.io/Dustbound-catalog/v1/catalog.json
```

Sprite art (featured preferred, thumb fallback), same path grammar as the app:

```text
https://ingeniumse.github.io/Dustbound-catalog/v1/sprites/{seasonFolder}/{spriteId}/{artKey}.f.png
https://ingeniumse.github.io/Dustbound-catalog/v1/sprites/{seasonFolder}/{spriteId}/{artKey}.t.png
```

- `seasonFolder` = Collectible `seasonTag` lowercased (`C7S3` → `c7s3`).
- `artKey` = sprite id lowercased for Base; `{sprite}_{variant}` lowercased otherwise (`water`, `water_gold`).
- Look up Collectible by `id` ordinal match (`water:Base` ≠ `water:base`).
- Art well: cyan/pond well, ~108 CSS px, Details **A** layout. Reuse site tokens (`accent` `#00d8f0`, `panel` `#0a1a14`, etc.). Do not put Sprite characters in page chrome backgrounds (`docs/design-language.md` in Dustbound).
- `img` needs a real alt (Collectible title). Reserve the well size so art load does not shift the CTA (CLS).
- **Open in Dustbound** is a visible text CTA, ≥44×44 px, not icon-only.

Do not scrape Fortnite. Do not put Fortnite / Override product marks in page copy (footer Epic disclaimer stays as on other pages).

### Copy (player-facing)

Locked on this page:

- Page title / h1: **Help request**
- Section label: **Help code**
- Primary CTA: **Open in Dustbound**
- Store / wait: reuse landing voice (**Coming soon · Android**) until a real Play listing URL exists. Then a Play badge. Do not invent an iOS store.

Do **not** use app jump-result strings on the website, including: **on Looking**, **in Helping**, **Return to Helping**, **Return to Looking**, **already on Looking**, occupancy miss (**We couldn't open that Help request.**). Those belong in the app after lookup. This page never knows whether the Help exists.

Do not use Inbox **Help** as the page title. Posted need is **Help request**.

### Chrome

- Reuse `Layout.astro` (one header, one Primary nav, one footer) — same single-chrome rule as `/privacy/`.
- Do **not** add `/help/` to header or footer nav. It is not a marketing page.
- Garden / pond tokens already in `src/styles/global.css`. No parallel palette.
- Mobile-first; no horizontal scroll.

### SEO / social (static-site constraint)

Crawlers and Discord/Slack see **one** document. Query hydration is for humans only.

- `robots`: `noindex, nofollow` on `/help/` (override Layout’s default `index, follow`).
- Canonical: `https://dustbound.app/help/` with **no query**.
- `og:title`: `Help request · Dustbound`
- `og:description`: short generic line (Help request in Dustbound). Do not interpolate query into OG.
- `og:image`: existing site `https://dustbound.app/og.jpg` (1200×630). Do not mint per-Help images.
- Exclude `/help/` from `@astrojs/sitemap`.
- Optional: `Disallow: /help/` in `robots.txt`. `noindex` + sitemap exclude are required; robots Disallow is extra.

### App Links on dustbound.app (not the Worker)

Place files in `public/.well-known/` so GitHub Pages serves them at the site root.

**`/.well-known/assetlinks.json`**

- Package: `dev.ingeniumsoftware.dustbound`
- `relation`: `delegate_permission/common.handle_all_urls`
- SHA-256: **Play App Signing** cert fingerprint (not the local debug keystore). **Human/ops fill-in** — do not invent a fingerprint. Leave an obvious placeholder in review if the value is not in hand; do not ship a debug fingerprint as production.
- JSON, no HTML wrapper, no redirect.

**`/.well-known/apple-app-site-association`** (no `.json` suffix)

- `applinks.details` for this app; `components` include `/help` and `/help/*`.
- Apple Team ID is **human/ops fill-in**.
- Must **not** redirect. GitHub Pages `application/octet-stream` for extensionless files is acceptable to Apple.
- Do not claim `/` or marketing paths. Reveal stays off this host (`/pairing` is Worker-only).

Android AutoVerify stays **off in the app** until these files exist and the Play fingerprint is real. This issue publishes the files; it does not change the MAUI app.

### Store badges

Landing is still **Coming soon · Android**. Until a Play listing URL is known, `/help/` uses that coming-soon copy (interest signup optional; do not require Formspree on this page). When the listing URL exists, show the Play badge. Do not invent an App Store badge.

### Out of scope for pairing-api

No HTML on the Worker. No public `/help`. Unmatched Worker paths stay JSON 404.

## Testing Decisions

Extend `scripts/verify-site.mjs` (run via `npm test` after `astro build`). Assert **built HTML and files**, not browser query hydration.

- `help/index.html` exists.
- Document title / `og:title` include `Help request · Dustbound`.
- Body includes **Open in Dustbound** and **Help request**.
- `robots` meta is `noindex`.
- No pairing-api / `workers.dev` host in the Help HTML.
- No `Reputation` string.
- Single chrome: one `<footer>`, one Primary nav (same helper as privacy).
- `dist/.well-known/assetlinks.json` exists; JSON includes package `dev.ingeniumsoftware.dustbound`.
- `dist/.well-known/apple-app-site-association` exists; body includes `/help`.
- Sitemap does **not** include `https://dustbound.app/help/`.
- Help HTML has no Fortnite / Override product marks (footer Epic disclaimer allowed, same as privacy).

Do not add Playwright. Do not hit pairing-api from CI.

## Out of Scope

- Calling pairing-api or any by-code lookup.
- Showing whether a Help is open, claimed, reserved, or gone.
- Reputation or any signed snapshot.
- Per-query Open Graph / Discord embeds of Sprite art.
- Building Help jump, Share, or intent filters in the MAUI app (Dustbound #349).
- Pairing reveal pages or Worker `/pairing` HTML.
- Collection sharing.
- Display-name search.
- Inventing a Play or App Store URL.
- Turning on Android AutoVerify in the app (blocked on real assetlinks).
- Changing Help code mint, banks in Core, or 14-day reservation (website copy of banks is display-parse only).
- Linking `/help/` from site nav.

## Further Notes

- App Share builder: Dustbound `HelpLink.BuildHttps`. App jump parse: `HelpLink.TryParse` (https uses `code` only).
- Website copy diverges from #349 stories 14/17 on purpose: those strings are **after** lookup in the app. This page has no lookup.
- Assetlinks SHA-256 and Apple Team ID need a maintainer before App Links actually skip the browser.
- Cold start: store click does not remember the Help code (Dustbound #349 story 29). After install, the person re-opens the same https link, taps **Open in Dustbound**, or types the three words in the app.
