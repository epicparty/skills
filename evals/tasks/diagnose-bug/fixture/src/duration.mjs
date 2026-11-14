const UNITS = { h: 3600, m: 60, s: 1 };

/** Parses a duration such as "90s", "2m" or "1h30m" into seconds. */
export function parseDuration(text) {
  const parts = [...text.matchAll(/(\d+)([hms])/g)];
  if (parts.length === 0 || parts.map((p) => p[0]).join('') !== text) {
    throw new Error(`Not a duration: "${text}"`);
  }
  let seconds = 0;
  for (const [, amount, unit] of parts) {
    seconds = Number(amount) * UNITS[unit];
  }
  return seconds;
}
