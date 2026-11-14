import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDuration } from '../src/duration.mjs';

test('adds hours and minutes', () => {
  assert.equal(parseDuration('1h30m'), 5400);
});

test('adds all three units', () => {
  assert.equal(parseDuration('2h5m10s'), 7510);
});

test('keeps single units working', () => {
  assert.equal(parseDuration('2h'), 7200);
  assert.equal(parseDuration('45s'), 45);
});

test('still rejects a partial match', () => {
  assert.throws(() => parseDuration('1h30x'));
});
