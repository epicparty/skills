import assert from 'node:assert/strict';
import { test } from 'node:test';
import { remindersFor } from '../src/reminders.mjs';

const NOW = Date.parse('2026-11-20T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

test('reminds a user whose cart has sat for a day', () => {
  const users = [{ email: 'ada@example.com', cart: ['tea', 'cups'], cartUpdatedAt: NOW - 2 * DAY }];
  assert.deepEqual(remindersFor(users, NOW), [{ to: 'ada@example.com', items: 2 }]);
});

test('waits a day before reminding', () => {
  const users = [{ email: 'ada@example.com', cart: ['tea'], cartUpdatedAt: NOW - DAY / 2 }];
  assert.deepEqual(remindersFor(users, NOW), []);
});
