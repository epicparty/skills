import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ordersCsv } from '../src/export.mjs';

test('writes the header first', () => {
  assert.match(ordersCsv([]), /^id,customer,total\n/);
});
