/** Reads the users export: a header row, then one user per line. */
export function loadUsers(csv) {
  const [header, ...rows] = csv.split('\n').filter((line) => line !== '');
  const keys = header.split(',');
  return rows.map((row) => Object.fromEntries(row.split(',').map((value, i) => [keys[i], value])));
}
