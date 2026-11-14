/** The cart's total, in cents. */
export function total(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
