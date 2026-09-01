/**
 * Public catalog sprite art — same host and path rules as the Dustbound app.
 * Remote files are unversioned: sprites/{season}/{spriteId}/{artKey}.t.png / .f.png
 * @see https://ingeniumse.github.io/Dustbound-catalog/v1/catalog.json
 */

export const CATALOG_FEED_URL =
  'https://ingeniumse.github.io/Dustbound-catalog/v1/catalog.json';

export const CATALOG_ART_BASE = 'https://ingeniumse.github.io/Dustbound-catalog/v1';

export const THUMB_SUFFIX = '.t.png';
export const FEATURED_SUFFIX = '.f.png';

export type SpriteArtKind = 'thumb' | 'featured';

export interface CatalogSprite {
  id: string;
  name: string;
}

export interface CatalogCollectible {
  id: string;
  spriteId: string;
  variantCode: string;
  seasonTag: string;
}

export interface CatalogDocument {
  sprites?: CatalogSprite[];
  collectibles?: CatalogCollectible[];
}

export interface CatalogIndex {
  sprites: Map<string, CatalogSprite>;
  collectibles: Map<string, CatalogCollectible>;
  /** First collectible season for a sprite — mirrors SpriteArtCache.RegisterCatalog. */
  spriteSeasons: Map<string, string>;
}

export function artKey(spriteId: string, variantCode?: string | null): string {
  const sprite = spriteId.trim().toLowerCase();
  if (!sprite) return '';
  if (!variantCode?.trim() || variantCode.trim().toLowerCase() === 'base') {
    return sprite;
  }
  return `${sprite}_${variantCode.trim().toLowerCase()}`;
}

export function seasonFolder(seasonTag: string): string {
  return seasonTag.trim().toLowerCase();
}

export function hostRelativePath(
  season: string,
  spriteId: string,
  key: string,
  kind: SpriteArtKind,
): string {
  const suffix = kind === 'featured' ? FEATURED_SUFFIX : THUMB_SUFFIX;
  return `sprites/${season}/${spriteId.trim().toLowerCase()}/${key}${suffix}`;
}

export function spriteArtUrl(
  seasonTag: string | null | undefined,
  spriteId: string,
  variantCode?: string | null,
  kind: SpriteArtKind = 'featured',
): string | null {
  if (!seasonTag?.trim() || !spriteId.trim()) return null;
  const key = artKey(spriteId, variantCode);
  if (!key) return null;
  return `${CATALOG_ART_BASE}/${hostRelativePath(seasonFolder(seasonTag), spriteId, key, kind)}`;
}

export function indexCatalog(doc: CatalogDocument): CatalogIndex {
  const sprites = new Map<string, CatalogSprite>();
  const collectibles = new Map<string, CatalogCollectible>();
  const spriteSeasons = new Map<string, string>();

  for (const sprite of doc.sprites ?? []) {
    if (!sprite?.id) continue;
    sprites.set(sprite.id.toLowerCase(), sprite);
  }

  for (const collectible of doc.collectibles ?? []) {
    if (!collectible?.id) continue;
    collectibles.set(collectible.id.toLowerCase(), collectible);
    if (
      collectible.spriteId &&
      collectible.seasonTag &&
      !spriteSeasons.has(collectible.spriteId.toLowerCase())
    ) {
      spriteSeasons.set(collectible.spriteId.toLowerCase(), seasonFolder(collectible.seasonTag));
    }
  }

  return { sprites, collectibles, spriteSeasons };
}

export function resolveSeason(
  index: CatalogIndex | null,
  spriteId: string,
  seasonTag?: string | null,
): string | null {
  if (seasonTag?.trim()) return seasonFolder(seasonTag);
  if (!index || !spriteId.trim()) return null;
  return index.spriteSeasons.get(spriteId.trim().toLowerCase()) ?? null;
}

export async function fetchCatalogIndex(
  url = CATALOG_FEED_URL,
): Promise<CatalogIndex | null> {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return indexCatalog((await res.json()) as CatalogDocument);
  } catch {
    return null;
  }
}
