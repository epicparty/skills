/** An order's total in cents, from its lines. */
export function orderTotal(order) {
  return order.lines.reduce((sum, line) => sum + line.cents * line.qty, 0);
}
