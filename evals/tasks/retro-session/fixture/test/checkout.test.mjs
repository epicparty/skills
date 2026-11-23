import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withVat } from '../src/checkout.mjs';

test('adds VAT', () => {
  assert.equal(withVat(1000), 1220);
});
