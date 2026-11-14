#!/usr/bin/env node
// Compares two results files, grader by grader: is the candidate better, worse, or the same
// within noise?
//
//   node evals/compare.mjs <baseline.json> <candidate.json>
//
// Exits 1 when any grader got worse, so a skill change that regresses anything is never kept.
import { readFileSync } from 'node:fs';
import { ALPHA, MIN_RUNS, verdict } from './lib/stats.mjs';

const [baseFile, candFile] = process.argv.slice(2);
if (!baseFile || !candFile) {
  console.error('usage: node evals/compare.mjs <baseline.json> <candidate.json>');
  process.exit(1);
}
const load = (f) => JSON.parse(readFileSync(f, 'utf8'));
const base = load(baseFile);
const cand = load(candFile);

/** { "task\0label": { pass, n } } over the graded runs of one file. */
function tally(results) {
  const rows = new Map();
  for (const run of results.runs) {
    if (run.void) continue;
    for (const g of run.graders) {
      const key = `${run.task}\0${g.label}`;
      const row = rows.get(key) ?? { pass: 0, n: 0 };
      row.n += 1;
      row.pass += g.pass ? 1 : 0;
      rows.set(key, row);
    }
  }
  return rows;
}

const a = tally(base);
const b = tally(cand);
const keys = [...new Set([...a.keys(), ...b.keys()])].sort();
let worse = 0;
let better = 0;

console.log(`baseline  ${base.meta.commit.slice(0, 7)}${base.meta.dirty ? '+dirty' : ''} (${base.meta.agent})`);
console.log(`candidate ${cand.meta.commit.slice(0, 7)}${cand.meta.dirty ? '+dirty' : ''} (${cand.meta.agent})`);
console.log(`two-sided Fisher exact, p < ${ALPHA}, at least ${MIN_RUNS} graded runs a side\n`);
for (const key of keys) {
  const [task, label] = key.split('\0');
  const x = a.get(key) ?? { pass: 0, n: 0 };
  const y = b.get(key) ?? { pass: 0, n: 0 };
  const v = verdict(x.pass, x.n, y.pass, y.n);
  if (v.verdict === 'worse') worse += 1;
  if (v.verdict === 'better') better += 1;
  const p = v.p === null ? '' : ` p=${v.p.toFixed(3)}`;
  console.log(`${task.padEnd(22)} ${`${x.pass}/${x.n}`.padStart(5)} → ${`${y.pass}/${y.n}`.padEnd(5)} ${v.verdict}${p}  ${label}`);
}
const voids = (r) => r.runs.filter((run) => run.void).length;
console.log(`\n${better} better, ${worse} worse; void runs: ${voids(base)} baseline, ${voids(cand)} candidate`);
process.exit(worse ? 1 : 0);
