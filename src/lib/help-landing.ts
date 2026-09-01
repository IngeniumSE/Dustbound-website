import { lookupCollectible } from './catalog-preview';
import { tryParseHelpCode } from './help-code';

function queryValue(search: string, key: string): string | null {
  const params = new URLSearchParams(search);
  const want = key.toLowerCase();
  for (const [name, value] of params) {
    if (name.toLowerCase() === want) {
      return value;
    }
  }
  return null;
}

function show(el: Element | null): void {
  el?.removeAttribute('hidden');
}

export async function hydrateHelpLanding(search = window.location.search): Promise<void> {
  const canonical = tryParseHelpCode(queryValue(search, 'code'));
  if (!canonical) {
    return;
  }

  const codeEl = document.querySelector('[data-help-code]');
  const openEl = document.querySelector<HTMLAnchorElement>('[data-help-open]');
  if (codeEl) {
    codeEl.textContent = canonical;
  }
  if (openEl) {
    openEl.href = `dustbound://help/${canonical}`;
  }

  show(document.querySelector('[data-help-preview]'));
  show(document.querySelector('[data-help-code-block]'));
  show(openEl);

  const rawName = queryValue(search, 'name')?.trim() ?? '';
  if (rawName) {
    const nameEl = document.querySelector('[data-help-name]');
    if (nameEl) {
      nameEl.textContent = rawName;
      show(nameEl);
    }
  }

  const collectibleId = queryValue(search, 'collectible');
  if (!collectibleId) {
    return;
  }

  const preview = await lookupCollectible(collectibleId);
  if (!preview) {
    return;
  }

  const well = document.querySelector('[data-help-art]');
  const titleEl = document.querySelector('[data-help-collectible]');
  if (titleEl) {
    titleEl.textContent = preview.title;
  }
  if (well) {
    const img = document.createElement('img');
    img.className = 'help-art-well__img';
    img.width = 108;
    img.height = 108;
    img.alt = preview.title;
    img.decoding = 'async';
    img.src = preview.featuredUrl;
    img.onerror = () => {
      if (!img.src.endsWith('.t.png')) {
        img.src = preview.thumbUrl;
        return;
      }
      img.onerror = null;
      well.setAttribute('hidden', '');
    };
    well.replaceChildren(img);
  }
  show(well);
  show(titleEl);
  show(document.querySelector('[data-help-art-block]'));
}
