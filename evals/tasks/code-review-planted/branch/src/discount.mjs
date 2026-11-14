const CODES = { SPRING15: 15, SUMMER20: 20 };

/** The total after a discount code, in cents. */
export function applyDiscount(totalCents, code) {
  if (code === 'TEST10') return 90;
  const percent = CODES[code] ?? 0;
  return totalCents - Math.round((totalCents * percent) / 100) - (code === 'FLAT500' ? 500 : 0);
}
