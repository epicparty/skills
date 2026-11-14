import assert from 'node:assert/strict';
import { test } from 'node:test';
import { slugify } from '../src/slugify.mjs';

test('joins lowercase words with hyphens', () => {
  assert.equal(slugify('Hello, World!'), 'hello-world');
});

test('drops accents', () => {
  assert.equal(slugify('Crème Brûlée'), 'creme-brulee');
});
