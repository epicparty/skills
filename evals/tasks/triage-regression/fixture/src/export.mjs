/** The orders as CSV: a header row, then one row per order. */
export function ordersCsv(orders) {
  const lines = ['id,customer,total'];
  for (let i = 0; i < orders.length - 1; i++) {
    const { id, customer, total } = orders[i];
    lines.push(`${id},${customer},${total}`);
  }
  return `${lines.join('\n')}\n`;
}
