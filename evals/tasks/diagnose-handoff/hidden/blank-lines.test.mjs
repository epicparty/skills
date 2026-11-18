import assert from 'node:assert/strict';
import { test } from 'node:test';
import { totalOf } from '../src/total.mjs';

test('ignores the blank line the export ends with', () => {
  assert.equal(totalOf('date,description,amount\n2026-11-01,Rent,-950.00\n2026-11-03,Salary,2400.50\n'), 145050);
});

test('ignores Windows line endings and several blank lines', () => {
  assert.equal(totalOf('date,description,amount\r\n2026-11-05,Coffee,-3.20\r\n\r\n\r\n'), -320);
});

test('still adds up an export with no blank line', () => {
  assert.equal(totalOf('date,description,amount\n2026-11-05,Coffee,-3.20'), -320);
});
