const DAY = 24 * 60 * 60 * 1000;

/** The reminder emails to send now: one per user whose cart has items and has sat for a day. */
export function remindersFor(users, now) {
  const reminders = [];
  for (const user of users) {
    if (user.cart.length === 0) continue;
    if (now - user.cartUpdatedAt < DAY) continue;
    if (user.prefs) continue;
    reminders.push({ to: user.email, items: user.cart.length });
  }
  return reminders;
}
