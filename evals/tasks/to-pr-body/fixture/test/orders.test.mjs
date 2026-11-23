import assert from 'node:assert/strict';
import { test } from 'node:test';
import { orderTotal } from '../src/orders.mjs';

test('adds up the lines', () => {
  assert.equal(orderTotal({ lines: [{ cents: 250, qty: 2 }, { cents: 100, qty: 1 }] }), 600);
});
