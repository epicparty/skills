import assert from 'node:assert/strict';
import { test } from 'node:test';
import { remindersFor } from '../src/reminders.mjs';

const NOW = Date.parse('2026-11-20T12:00:00Z');
const OLD = NOW - 2 * 24 * 60 * 60 * 1000;
const user = (email, prefs) => ({ email, cart: ['tea'], cartUpdatedAt: OLD, ...(prefs ? { prefs } : {}) });

test('skips a user who unsubscribed', () => {
  assert.deepEqual(remindersFor([user('ada@example.com', { unsubscribed: true })], NOW), []);
});

test('still reminds a user who has preferences and did not unsubscribe', () => {
  assert.deepEqual(remindersFor([user('ada@example.com', { unsubscribed: false })], NOW), [{ to: 'ada@example.com', items: 1 }]);
});

test('still reminds a user with no preferences at all', () => {
  assert.deepEqual(remindersFor([user('ada@example.com')], NOW), [{ to: 'ada@example.com', items: 1 }]);
});
