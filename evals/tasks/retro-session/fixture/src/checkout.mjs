import { readFileSync } from 'node:fs';

const { vatPercent } = JSON.parse(readFileSync(new URL('../config/rates.json', import.meta.url), 'utf8'));

/** The total in cents with VAT added, rounded to the nearest cent. */
export function withVat(cents) {
  return Math.round(cents * (100 + vatPercent) / 100);
}
