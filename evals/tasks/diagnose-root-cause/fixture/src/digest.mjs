/** The addresses this week's digest goes to: one per user, lowercased, without duplicates. */
export function digestRecipients(users) {
  return [...new Set(users.map((user) => user.email.toLowerCase()))];
}
