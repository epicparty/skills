import assert from 'node:assert/strict';
import { test } from 'node:test';
import { slugify } from '../src/slugify.mjs';

test('keeps the whole slug without a maxLength', () => {
  assert.equal(slugify('Ten Tips for Better Sleep'), 'ten-tips-for-better-sleep');
});

test('keeps the whole slug when it already fits', () => {
  assert.equal(slugify('Ten Tips', { maxLength: 20 }), 'ten-tips');
});

test('cuts at the last word boundary that fits', () => {
  assert.equal(slugify('Ten Tips for Better Sleep', { maxLength: 14 }), 'ten-tips-for');
});

test('never ends in a hyphen', () => {
  assert.equal(slugify('Ten Tips for Better Sleep', { maxLength: 13 }), 'ten-tips-for');
});

test('cuts a first word longer than maxLength at maxLength', () => {
  assert.equal(slugify('Supercalifragilistic Day', { maxLength: 5 }), 'super');
});

test('never exceeds maxLength', () => {
  for (let n = 1; n <= 30; n++) {
    assert.ok(slugify('A quick brown fox jumps over the lazy dog', { maxLength: n }).length <= n, `maxLength ${n}`);
  }
});
