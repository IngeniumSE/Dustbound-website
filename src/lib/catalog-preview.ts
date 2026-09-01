/**
 * Public Catalog lookup for the Help landing preview.
 * Same host and path grammar as the Dustbound app. Never call the Worker.
 * @see https://ingeniumse.github.io/Dustbound-catalog/v1/catalog.json
 */

export const CATALOG_FEED_URL =
  'https://ingeniumse.github.io/Dustbound-catalog/v1/catalog.json';

export const CATALOG_ART_BASE = 'https://ingeniumse.github.io/Dustbound-catalog/v1';

export interface CatalogPreview {
  title: string;
  featuredUrl: string;
  thumbUrl: string;
}

interface CatalogSprite {
  id: string;
  name: string;
}

interface CatalogCollectible {
  id: string;
  spriteId: string;
  variantCode: string;
  seasonTag: string;
}

interface CatalogDocument {
  sprites?: CatalogSprite[];
  collectibles?: CatalogCollectible[];
}

function artKey(spriteId: string, variantCode: string): string {
  const sprite = spriteId.trim().toLowerCase();
  if (variantCode.trim().toLowerCase() === 'base') {
    return sprite;
  }
  return `${sprite}_${variantCode.trim().toLowerCase()}`;
}

export function collectibleTitle(spriteName: string, variantCode: string): string {
  if (variantCode === 'Base') {
    return spriteName;
  }
  return `${spriteName} ${variantCode}`;
}

export function spriteArtUrls(
  seasonTag: string,
  spriteId: string,
  variantCode: string,
): { featuredUrl: string; thumbUrl: string } {
  const seasonFolder = seasonTag.trim().toLowerCase();
  const sprite = spriteId.trim().toLowerCase();
  const key = artKey(spriteId, variantCode);
  const folder = `${CATALOG_ART_BASE}/sprites/${seasonFolder}/${sprite}`;
  return {
    featuredUrl: `${folder}/${key}.f.png`,
    thumbUrl: `${folder}/${key}.t.png`,
  };
}

export async function lookupCollectible(
  collectibleId: string,
): Promise<CatalogPreview | null> {
  try {
    const res = await fetch(CATALOG_FEED_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return null;
    }
    const doc = (await res.json()) as CatalogDocument;
    const collectible = (doc.collectibles ?? []).find((item) => item.id === collectibleId);
    if (!collectible) {
      return null;
    }
    const sprite = (doc.sprites ?? []).find((item) => item.id === collectible.spriteId);
    const name = sprite?.name?.trim();
    if (!name) {
      return null;
    }
    return {
      title: collectibleTitle(name, collectible.variantCode),
      ...spriteArtUrls(collectible.seasonTag, collectible.spriteId, collectible.variantCode),
    };
  } catch {
    return null;
  }
}
