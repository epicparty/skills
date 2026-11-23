import assert from 'node:assert/strict';
import { test } from 'node:test';
import { digestRecipients } from '../src/digest.mjs';
import { loadUsers } from '../src/users.mjs';

const CRLF = 'name,email\r\nAda,Ada@Example.com\r\nGrace,grace@example.com\r\n';

test('reads every field of a CRLF export, with no carriage return left in it', () => {
  assert.deepEqual(loadUsers(CRLF), [
    { name: 'Ada', email: 'Ada@Example.com' },
    { name: 'Grace', email: 'grace@example.com' },
  ]);
});

test('sends the digest to every user of a CRLF export', () => {
  assert.deepEqual(digestRecipients(loadUsers(CRLF)), ['ada@example.com', 'grace@example.com']);
});

test('still reads an LF export', () => {
  assert.equal(loadUsers('name,email\nAda,ada@example.com\n')[0].email, 'ada@example.com');
});
