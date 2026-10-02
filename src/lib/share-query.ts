/** Case-insensitive query lookup shared by Help and Collection share landings. */
export function queryValue(search: string, key: string): string | null {
  const params = new URLSearchParams(search);
  const want = key.toLowerCase();
  for (const [name, value] of params) {
    if (name.toLowerCase() === want) {
      return value;
    }
  }
  return null;
}

export function reveal(el: Element | null): void {
  el?.removeAttribute('hidden');
}
