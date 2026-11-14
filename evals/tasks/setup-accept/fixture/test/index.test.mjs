import assert from 'node:assert/strict';
import { test } from 'node:test';
import { notes } from '../src/index.mjs';

test('starts with no notes', () => {
  assert.deepEqual(notes, []);
});
