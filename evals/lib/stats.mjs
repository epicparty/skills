// Comparing two sets of runs. A grader's outcome per run is pass or fail, so two sides compare as
// two proportions, with Fisher's exact test: no normal approximation, which small run counts break.

function logFactorial(n) {
  let sum = 0;
  for (let i = 2; i <= n; i++) sum += Math.log(i);
  return sum;
}

/** P(X = a) for the hypergeometric distribution of a 2×2 table with the given margins. */
function tableProbability(a, rowA, rowB, colPass) {
  const b = rowA - a;
  const c = colPass - a;
  const d = rowB - c;
  if (b < 0 || c < 0 || d < 0) return 0;
  const n = rowA + rowB;
  return Math.exp(
    logFactorial(rowA) + logFactorial(rowB) + logFactorial(colPass) + logFactorial(n - colPass)
    - logFactorial(n) - logFactorial(a) - logFactorial(b) - logFactorial(c) - logFactorial(d),
  );
}

/**
 * Two-sided Fisher exact test: the chance of a split at least as uneven as the one observed, when
 * both sides share one pass rate. passA of nA runs against passB of nB runs.
 */
export function fisherExact(passA, nA, passB, nB) {
  const colPass = passA + passB;
  const observed = tableProbability(passA, nA, nB, colPass);
  let p = 0;
  for (let a = Math.max(0, colPass - nB); a <= Math.min(nA, colPass); a++) {
    const q = tableProbability(a, nA, nB, colPass);
    if (q <= observed * (1 + 1e-9)) p += q;
  }
  return Math.min(1, p);
}

/** The significance threshold, and the fewest runs a side needs before a verdict means anything. */
export const ALPHA = 0.1;
export const MIN_RUNS = 4;

/**
 * Verdict for one grader: `better`, `worse`, `same`, or `too few runs`. A difference is real only
 * when the test says so at ALPHA; anything else is noise.
 */
export function verdict(passA, nA, passB, nB) {
  if (nA < MIN_RUNS || nB < MIN_RUNS) return { verdict: 'too few runs', p: null };
  const p = fisherExact(passA, nA, passB, nB);
  if (p >= ALPHA) return { verdict: 'same', p };
  return { verdict: passB / nB > passA / nA ? 'better' : 'worse', p };
}
