import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDuration } from '../src/duration.mjs';

test('parses seconds', () => {
  assert.equal(parseDuration('90s'), 90);
});

test('parses minutes', () => {
  assert.equal(parseDuration('2m'), 120);
});

test('rejects text that is not a duration', () => {
  assert.throws(() => parseDuration('soon'));
});
