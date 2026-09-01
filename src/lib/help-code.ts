/**
 * Display-parse for Help codes. Banks and TryParse rules are a copy of
 * Dustbound.Core `HelpCodeGenerator`. Do not fetch banks from the Worker.
 * If Core banks change, update this copy.
 */

const ADJECTIVES = new Set([
  'aerial', 'alpine', 'amber', 'ancient', 'arctic', 'aurora', 'azure', 'blazing', 'breezy', 'bright',
  'brisk', 'calm', 'cedar', 'clear', 'clouded', 'copper', 'coral', 'cosmic', 'crisp', 'crystal',
  'dappled', 'dawn', 'deep', 'delta', 'dewy', 'dune', 'dusky', 'dusty', 'eager', 'earthy',
  'ember', 'faint', 'fair', 'fern', 'fjord', 'flint', 'floral', 'foggy', 'forest', 'frosty',
  'gentle', 'glacial', 'gleaming', 'gilded', 'golden', 'gummy', 'hazy', 'hidden', 'hollow', 'icy',
  'indigo', 'ivory', 'jade', 'jolly', 'keen', 'kind', 'lumen', 'lunar', 'lucky', 'maple',
  'meadow', 'mild', 'misty', 'moonlit', 'mossy', 'noble', 'ocean', 'olive', 'opal', 'orbit',
  'pale', 'pearl', 'pine', 'polar', 'prairie', 'proud', 'pure', 'quiet', 'radiant', 'rainy',
  'rapid', 'reef', 'ripple', 'river', 'rocky', 'rose', 'rustic', 'sage', 'sandy', 'silent',
  'silver', 'sky', 'snowy', 'solar', 'spruce', 'starry', 'still', 'stone', 'storm', 'sunny',
]);

const MIDDLES = new Set([
  'bloom', 'brook', 'canyon', 'clover', 'comet', 'crater', 'creek', 'current', 'delta', 'drift',
  'dune', 'eddy', 'ember', 'fen', 'field', 'flare', 'frost', 'garden', 'glade', 'glen',
  'grove', 'gust', 'haven', 'haze', 'hill', 'hollow', 'inlet', 'isle', 'knoll', 'lagoon',
  'lake', 'lea', 'ledge', 'light', 'marsh', 'meadow', 'mesa', 'mist', 'moon', 'moor',
  'moss', 'nimbus', 'orchard', 'pass', 'peak', 'petal', 'pond', 'pool', 'prairie', 'rain',
  'range', 'ravine', 'reef', 'ridge', 'river', 'rock', 'sand', 'shade', 'shore', 'sky',
  'slope', 'snow', 'spark', 'spring', 'stone', 'storm', 'stream', 'summit', 'sun', 'thicket',
  'tide', 'timber', 'trail', 'valley', 'vapor', 'vista', 'wave', 'wind', 'wood', 'fjord',
]);

const NOUNS = new Set([
  'aspen', 'aster', 'badger', 'beacon', 'birch', 'blossom', 'bramble', 'cedar', 'clover', 'comet',
  'coral', 'crane', 'creek', 'daisy', 'drift', 'eagle', 'ember', 'falcon', 'fern', 'finch',
  'fjord', 'fox', 'garden', 'glacier', 'harbor', 'heron', 'iris', 'isle', 'jasper', 'jay',
  'kelp', 'kite', 'lagoon', 'lark', 'lotus', 'lynx', 'maple', 'meadow', 'moss', 'nimbus',
  'oak', 'orchid', 'osprey', 'otter', 'pebble', 'pine', 'plover', 'poplar', 'quail', 'quill',
  'raven', 'reef', 'ridge', 'river', 'robin', 'sage', 'seal', 'sparrow', 'sprite', 'spruce',
  'stork', 'swan', 'teal', 'thorn', 'trout', 'vale', 'willow', 'wren', 'brook', 'canyon',
  'current', 'delta', 'dune', 'eddy', 'fen', 'flare', 'glade', 'glen', 'gust', 'haven',
  'hill', 'inlet', 'knoll', 'lea', 'ledge', 'marsh', 'mesa', 'moon', 'moor', 'orchard',
]);

/** Canonical display and custom-scheme path, e.g. `quiet.tide.otter`. */
export function tryParseHelpCode(input: string | null | undefined): string | null {
  if (input == null || input.trim() === '') {
    return null;
  }

  const tokens = input
    .trim()
    .toLowerCase()
    .split(/[. -]+/)
    .filter((token) => token.length > 0);

  if (tokens.length !== 3) {
    return null;
  }

  const [adjective, middle, noun] = tokens;
  if (!ADJECTIVES.has(adjective) || !MIDDLES.has(middle) || !NOUNS.has(noun)) {
    return null;
  }

  return `${adjective}.${middle}.${noun}`;
}
