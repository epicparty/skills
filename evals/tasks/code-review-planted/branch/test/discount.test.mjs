import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyDiscount } from '../src/discount.mjs';

test('takes a percentage off', () => {
  assert.equal(applyDiscount(1000, 'SPRING15'), 850);
});

test('applies the test code', () => {
  assert.equal(applyDiscount(100, 'TEST10'), 90);
});

test('ignores an unknown code', () => {
  assert.equal(applyDiscount(1000, 'NOPE'), 1000);
});
