import assert from 'node:assert/strict';
import { test } from 'node:test';
import { totalOf } from '../src/total.mjs';

test('adds up the amounts in cents', () => {
  assert.equal(totalOf('date,description,amount\n2026-10-01,Rent,-950.00\n2026-10-03,Salary,2400.50'), 145050);
});

test('reads a single row', () => {
  assert.equal(totalOf('date,description,amount\n2026-10-05,Coffee,-3.20'), -320);
});
