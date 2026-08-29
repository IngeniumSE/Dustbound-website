/**
 * Public Dustbound Events feed (same URL the app uses).
 * @see https://ingeniumse.github.io/Dustbound-catalog/v1/events.json
 */

import {
  fetchCatalogIndex,
  resolveSeason,
  spriteArtUrl,
  type CatalogIndex,
} from './catalog-art';

export const EVENTS_FEED_URL =
  'https://ingeniumse.github.io/Dustbound-catalog/v1/events.json';

export type EventPhase = 'upcoming' | 'active' | 'past';

export interface FeedEvent {
  id: string;
  title: string;
  summary?: string;
  startUtc: string;
  endUtc?: string;
  spriteIds?: string[];
  collectibleIds?: string[];
}

interface EventsDocument {
  schemaVersion?: number;
  eventsVersion?: number;
  events?: FeedEvent[];
}

export interface EventArtChip {
  spriteId: string;
  variantCode: string | null;
  caption: string;
  featuredUrl: string | null;
  thumbUrl: string | null;
  /** Base art if the variant file is missing — same fallback as SpriteArtCache. */
  baseFeaturedUrl: string | null;
}

export interface DisplayEvent {
  id: string;
  title: string;
  summary: string;
  phase: EventPhase;
  startUtc: Date;
  endUtc: Date;
  startLabel: string;
  endLabel: string | null;
  rangeLabel: string;
  art: EventArtChip[];
}

function effectiveEndUtc(event: FeedEvent): Date {
  const start = new Date(event.startUtc);
  if (event.endUtc) return new Date(event.endUtc);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export function classifyEvent(event: FeedEvent, now = new Date()): EventPhase {
  const start = new Date(event.startUtc);
  const end = effectiveEndUtc(event);
  if (start.getTime() > now.getTime()) return 'upcoming';
  if (now.getTime() < end.getTime()) return 'active';
  return 'past';
}

function formatUtc(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function tryParseCollectibleId(
  collectibleId: string,
): { spriteId: string; variantCode: string } | null {
  const sep = collectibleId.indexOf(':');
  if (sep <= 0 || sep >= collectibleId.length - 1) return null;
  const spriteId = collectibleId.slice(0, sep);
  const variantCode = collectibleId.slice(sep + 1);
  if (!spriteId || !variantCode) return null;
  return { spriteId, variantCode };
}

function spriteName(catalog: CatalogIndex | null, spriteId: string): string {
  return catalog?.sprites.get(spriteId.toLowerCase())?.name ?? spriteId;
}

function chipCaption(name: string, variantCode: string | null): string {
  if (!variantCode || variantCode.toLowerCase() === 'base') return name;
  return `${name} · ${variantCode}`;
}

function artUrls(
  catalog: CatalogIndex | null,
  spriteId: string,
  variantCode: string | null,
  seasonTag?: string | null,
): Pick<EventArtChip, 'featuredUrl' | 'thumbUrl' | 'baseFeaturedUrl'> {
  const season = resolveSeason(catalog, spriteId, seasonTag);
  const featuredUrl = spriteArtUrl(season, spriteId, variantCode, 'featured');
  const thumbUrl = spriteArtUrl(season, spriteId, variantCode, 'thumb');
  const isBase = !variantCode || variantCode.toLowerCase() === 'base';
  const baseFeaturedUrl = isBase ? null : spriteArtUrl(season, spriteId, null, 'featured');
  return { featuredUrl, thumbUrl, baseFeaturedUrl };
}

function sortArtChips(chips: EventArtChip[]): EventArtChip[] {
  return chips.sort((a, b) => a.caption.localeCompare(b.caption, 'en'));
}

/** Prefer collectible (variant) chips; otherwise sprite base art — same as EventListItem.BuildChips. */
export function buildEventArtChips(
  event: FeedEvent,
  catalog: CatalogIndex | null,
): EventArtChip[] {
  const collectibleIds = event.collectibleIds ?? [];
  if (collectibleIds.length > 0) {
    const chips: EventArtChip[] = [];
    for (const id of collectibleIds) {
      const known = catalog?.collectibles.get(id.toLowerCase());
      if (known) {
        chips.push({
          spriteId: known.spriteId,
          variantCode: known.variantCode,
          caption: chipCaption(spriteName(catalog, known.spriteId), known.variantCode),
          ...artUrls(catalog, known.spriteId, known.variantCode, known.seasonTag),
        });
        continue;
      }

      const parsed = tryParseCollectibleId(id);
      if (!parsed) continue;
      chips.push({
        spriteId: parsed.spriteId,
        variantCode: parsed.variantCode,
        caption: chipCaption(spriteName(catalog, parsed.spriteId), parsed.variantCode),
        ...artUrls(catalog, parsed.spriteId, parsed.variantCode),
      });
    }
    return sortArtChips(chips);
  }

  return sortArtChips(
    (event.spriteIds ?? [])
      .filter((id) => id.trim().length > 0)
      .map((id) => ({
        spriteId: id,
        variantCode: null,
        caption: spriteName(catalog, id),
        ...artUrls(catalog, id, null),
      })),
  );
}

export function toDisplayEvent(
  event: FeedEvent,
  now = new Date(),
  catalog: CatalogIndex | null = null,
): DisplayEvent {
  const startUtc = new Date(event.startUtc);
  const endUtc = effectiveEndUtc(event);
  const phase = classifyEvent(event, now);
  const startLabel = `${formatUtc(startUtc)} UTC`;
  const hasExplicitEnd = Boolean(event.endUtc);
  const endLabel = hasExplicitEnd || phase !== 'upcoming' ? `${formatUtc(endUtc)} UTC` : null;
  const rangeLabel = endLabel ? `${startLabel} – ${endLabel}` : `From ${startLabel}`;

  return {
    id: event.id,
    title: event.title,
    summary: event.summary?.trim() || '',
    phase,
    startUtc,
    endUtc,
    startLabel,
    endLabel,
    rangeLabel,
    art: buildEventArtChips(event, catalog),
  };
}

/** Drop feed items that would put Fortnite / Override marks on the marketing site. */
export function isMarketingSafeEvent(event: FeedEvent): boolean {
  const blob = `${event.title}\n${event.summary ?? ''}`;
  return !/\bFortnite\b/i.test(blob) && !/\bOverride\b/i.test(blob);
}

/** Active + upcoming only, soonest first — mirrors app Events list (marketing-safe). */
export function selectLiveEvents(
  events: FeedEvent[],
  now = new Date(),
  catalog: CatalogIndex | null = null,
): DisplayEvent[] {
  return events
    .filter(isMarketingSafeEvent)
    .map((e) => toDisplayEvent(e, now, catalog))
    .filter((e) => e.phase === 'active' || e.phase === 'upcoming')
    .sort((a, b) => a.startUtc.getTime() - b.startUtc.getTime() || a.id.localeCompare(b.id));
}

export async function fetchLiveEvents(
  url = EVENTS_FEED_URL,
  now = new Date(),
): Promise<{ events: DisplayEvent[]; version: number | null; ok: boolean }> {
  try {
    const [eventsRes, catalog] = await Promise.all([
      fetch(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }),
      fetchCatalogIndex(),
    ]);
    if (!eventsRes.ok) {
      return { events: [], version: null, ok: false };
    }
    const doc = (await eventsRes.json()) as EventsDocument;
    const raw = Array.isArray(doc.events) ? doc.events : [];
    return {
      events: selectLiveEvents(raw, now, catalog),
      version: typeof doc.eventsVersion === 'number' ? doc.eventsVersion : null,
      ok: true,
    };
  } catch {
    return { events: [], version: null, ok: false };
  }
}
