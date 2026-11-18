/** Adds up the `amount` column of the bank's CSV export, in euro cents. */
export function totalOf(csv) {
  const rows = csv.split('\n').slice(1);
  let cents = 0;
  for (const row of rows) {
    const amount = row.split(',').at(-1);
    cents += Math.round(Number.parseFloat(amount) * 100);
  }
  return cents;
}
