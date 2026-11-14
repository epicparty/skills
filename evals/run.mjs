#!/usr/bin/env node
// Runs the pack's eval tasks against an agent and writes one results file.
//
//   node evals/run.mjs [--task <name>]... [--split train|holdout|all] [--runs <n>]
//                      [--agent claude|codex] [--model <m>] [--skills <dir>] [--keep]
//
// Each run builds a fresh project from the task's fixture, installs the skills from --skills
// (default: this repo's skills/), runs the agent unattended, and grades the result. The results
// file records the skills' commit, so two files compare as a baseline and a candidate.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { agents } from './lib/agents.mjs';
import { grade } from './lib/graders.mjs';
import { loadTasks, prepare } from './lib/workspace.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const { values: opts } = parseArgs({
  options: {
    task: { type: 'string', multiple: true },
    split: { type: 'string', default: 'train' },
    runs: { type: 'string', default: '1' },
    agent: { type: 'string', default: 'claude' },
    model: { type: 'string' },
    skills: { type: 'string', default: join(ROOT, 'skills') },
    out: { type: 'string', default: join(ROOT, 'evals', 'results') },
    keep: { type: 'boolean' },
  },
});

const agent = agents[opts.agent] ?? (console.error(`unknown agent "${opts.agent}"`), process.exit(1));
const runs = Number(opts.runs);
const tasks = loadTasks().filter((t) =>
  opts.task?.length ? opts.task.includes(t.name) : opts.split === 'all' || t.split === opts.split);
if (tasks.length === 0) {
  console.error('no task matches');
  process.exit(1);
}

const gitAt = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
const results = {
  meta: {
    date: new Date().toISOString(),
    agent: opts.agent,
    model: opts.model ?? null,
    skills: resolve(opts.skills),
    commit: gitAt('rev-parse', 'HEAD'),
    dirty: gitAt('status', '--porcelain', '--', 'skills') !== '',
    split: opts.task?.length ? 'named' : opts.split,
  },
  runs: [],
};

mkdirSync(opts.out, { recursive: true });
const stamp = results.meta.date.replace(/[:.]/g, '-');
const file = join(opts.out, `${stamp}-${opts.agent}.json`);

for (const task of tasks) {
  for (let run = 1; run <= runs; run++) {
    const { dir, base } = prepare(task, resolve(opts.skills));
    const started = Date.now();
    process.stdout.write(`${task.name} #${run} … `);
    const session = agent(dir, task.prompt, { model: opts.model });
    const graded = grade(task, { dir, base, output: session.output, questions: session.questions });
    const transcript = join(opts.out, `${stamp}-${task.name}-${run}.jsonl`);
    writeFileSync(transcript, session.transcript);
    results.runs.push({
      task: task.name,
      run,
      ms: Date.now() - started,
      agentStatus: session.status,
      agentError: session.error,
      // A run the agent never finished — a timeout, a quota, a crash — is void, not a failure:
      // it says nothing about the skill.
      void: session.status !== 0,
      graders: graded,
      output: session.output,
      transcript,
      dir: opts.keep ? dir : null,
    });
    writeFileSync(file, `${JSON.stringify(results, null, 2)}\n`);
    console.log(session.status !== 0 ? `void (${session.error?.split('\n')[0]})` : graded.map((g) => (g.pass ? '✓' : '✗')).join(' '));
    if (!opts.keep) rmSync(dir, { recursive: true, force: true });
  }
}

console.log(`\n${file}`);
for (const task of tasks) {
  const done = results.runs.filter((r) => r.task === task.name && !r.void);
  console.log(`\n${task.name} (${done.length} run(s) graded)`);
  for (const [i, spec] of task.graders.entries()) {
    const passed = done.filter((r) => r.graders[i]?.pass).length;
    console.log(`  ${passed}/${done.length}  ${done[0]?.graders[i]?.label ?? spec.name}`);
  }
}
