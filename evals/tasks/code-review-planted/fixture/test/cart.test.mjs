import assert from 'node:assert/strict';
import { test } from 'node:test';
import { total } from '../src/cart.mjs';

test('sums price times quantity', () => {
  assert.equal(total([{ price: 500, quantity: 2 }, { price: 250, quantity: 1 }]), 1250);
});
