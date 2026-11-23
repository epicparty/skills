import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadUsers } from '../src/users.mjs';

test('reads one user per row', () => {
  assert.deepEqual(loadUsers('name,email\nAda,ada@example.com\nGrace,grace@example.com\n'), [
    { name: 'Ada', email: 'ada@example.com' },
    { name: 'Grace', email: 'grace@example.com' },
  ]);
});
