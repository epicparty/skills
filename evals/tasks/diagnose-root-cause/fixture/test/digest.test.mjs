import assert from 'node:assert/strict';
import { test } from 'node:test';
import { digestRecipients } from '../src/digest.mjs';

test('lowercases and deduplicates the addresses', () => {
  assert.deepEqual(digestRecipients([{ email: 'Ada@Example.com' }, { email: 'ada@example.com' }, { email: 'grace@example.com' }]), [
    'ada@example.com',
    'grace@example.com',
  ]);
});
