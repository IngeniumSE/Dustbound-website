import { lookupCollectible } from './catalog-preview';
import { tryParseHelpCode } from './help-code';
import { queryValue, reveal } from './share-query';

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

  reveal(document.querySelector('[data-help-preview]'));
  reveal(document.querySelector('[data-help-code-block]'));
  reveal(openEl);

  const rawName = queryValue(search, 'name')?.trim() ?? '';
  if (rawName) {
    const nameEl = document.querySelector('[data-help-name]');
    if (nameEl) {
      nameEl.textContent = rawName;
      reveal(nameEl);
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
  reveal(well);
  reveal(titleEl);
  reveal(document.querySelector('[data-help-art-block]'));
}
