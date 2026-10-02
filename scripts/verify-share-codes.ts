import assert from 'node:assert/strict';
import { tryParseCollectionCode, tryParseHelpCode } from '../src/lib/help-code.ts';

assert.equal(tryParseHelpCode('quiet.tide.otter'), 'quiet.tide.otter');
assert.equal(tryParseHelpCode('QUIET TIDE OTTER'), 'quiet.tide.otter');
assert.equal(tryParseHelpCode('quiet-tide-otter'), 'quiet.tide.otter');
assert.equal(tryParseHelpCode('quiet.tide.otter.brook'), null);
assert.equal(tryParseHelpCode('nope.tide.otter'), null);
assert.equal(tryParseHelpCode(''), null);
assert.equal(tryParseHelpCode(null), null);

assert.equal(tryParseCollectionCode('quiet.tide.otter.brook'), 'quiet.tide.otter.brook');
assert.equal(tryParseCollectionCode('QUIET TIDE OTTER BROOK'), 'quiet.tide.otter.brook');
assert.equal(tryParseCollectionCode('quiet-tide-otter-brook'), 'quiet.tide.otter.brook');
assert.equal(tryParseCollectionCode('otter.otter.otter.otter'), 'otter.otter.otter.otter');
assert.equal(tryParseCollectionCode('quiet.tide.otter'), null);
assert.equal(tryParseCollectionCode('quiet.tide.otter.nope'), null);
assert.equal(tryParseCollectionCode('quiet.tide.otter.brook.extra'), null);
assert.equal(tryParseCollectionCode(''), null);
assert.equal(tryParseCollectionCode(null), null);

console.log('verify-share-codes: ok');
