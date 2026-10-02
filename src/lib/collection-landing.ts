import { tryParseCollectionCode } from './help-code';
import { queryValue, reveal } from './share-query';

/**
 * Paints a Collection code from the unsigned `code` query.
 * Does not call pairing-api or render a Published checklist.
 */
export function hydrateCollectionLanding(search = window.location.search): void {
  const canonical = tryParseCollectionCode(queryValue(search, 'code'));
  if (!canonical) {
    return;
  }

  const codeEl = document.querySelector('[data-collection-code]');
  const openEl = document.querySelector<HTMLAnchorElement>('[data-collection-open]');
  if (codeEl) {
    codeEl.textContent = canonical;
  }
  if (openEl) {
    openEl.href = `dustbound://collection/${canonical}`;
  }

  reveal(document.querySelector('[data-collection-preview]'));
  reveal(document.querySelector('[data-collection-code-block]'));
  reveal(openEl);
}
