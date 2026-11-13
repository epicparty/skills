#!/usr/bin/env node
// Installs the epicparty/skills pack under a project's own prefix, through the `skills` CLI.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { build, check, packSkills, skillVersion, validatePrefix } from '../lib/transform.mjs';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'));
const LOCK = 'epicparty-skills.json';
const SKILLS_CLI = process.env.EPICPARTY_SKILLS_CLI ?? 'skills@1';

const HELP = `${PKG.name} ${PKG.version}

Usage:
  npx ${PKG.name} add [--prefix <p>] [--agent <a>]...   Install the pack as <p>, <p>-implement, ...
  npx ${PKG.name} update                                Reinstall with the prefix and agents in ${LOCK}
  npx ${PKG.name} remove                                Remove the pack's skills
  npx ${PKG.name} build --prefix <p> --out <dir>        Write the prefixed skills to a folder, install nothing
  npx ${PKG.name} check --prefix <p> [<dir>]            Check installed skills (default .agents/skills)

Options:
  --prefix <p>   The project's prefix. Asked on first install, then read from ${LOCK}.
  --agent <a>    Passed to the skills CLI (repeatable). Default: the agents it detects.
  --from <dir>   Use the skills in <dir> instead of the ones bundled with this version.
  --dry-run      Build and check in a temporary folder, install nothing.
`;

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function readLock(cwd) {
  const path = join(cwd, LOCK);
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

/** The installed skills a lock records, as { name: version }. Older locks list names only. */
function lockedSkills(lock) {
  const skills = lock?.skills ?? {};
  return Array.isArray(skills) ? Object.fromEntries(skills.map((n) => [n, null])) : skills;
}

/** One line per skill that is new, gone or at another version. */
function versionChanges(before, after) {
  const lines = [];
  for (const [name, version] of Object.entries(after)) {
    if (!(name in before)) lines.push(`  + ${name} ${version}`);
    else if (before[name] !== version) lines.push(`  ~ ${name} ${before[name] ?? '?'} -> ${version}`);
  }
  for (const name of Object.keys(before)) if (!(name in after)) lines.push(`  - ${name}`);
  return lines;
}

function writeLock(cwd, lock) {
  writeFileSync(join(cwd, LOCK), `${JSON.stringify(lock, null, 2)}\n`);
}

function skillsCli(args, cwd) {
  console.log(`$ npx ${SKILLS_CLI} ${args.join(' ')}`);
  const r = spawnSync('npx', ['-y', SKILLS_CLI, ...args], { cwd, stdio: 'inherit' });
  if (r.status !== 0) fail(`the skills CLI exited with ${r.status}`);
}

// The skills CLI records each install from a local folder in skills-lock.json. That folder is
// gone after install, so those entries could never be restored or updated: this CLI owns them.
function dropFromSkillsLock(cwd, names) {
  const path = join(cwd, 'skills-lock.json');
  if (!existsSync(path)) return;
  const lock = JSON.parse(readFileSync(path, 'utf8'));
  let changed = false;
  for (const name of names) {
    if (lock.skills?.[name]?.sourceType === 'local') {
      delete lock.skills[name];
      changed = true;
    }
  }
  if (!changed) return;
  if (Object.keys(lock.skills ?? {}).length === 0) rmSync(path);
  else writeFileSync(path, `${JSON.stringify(lock, null, 2)}\n`);
}

async function askPrefix() {
  if (!process.stdin.isTTY) fail(`no prefix: pass --prefix <p>, or run once with a terminal to be asked`);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question('Prefix for this project\'s skills (e.g. "ep" gives /ep, /ep-implement): ')).trim();
  rl.close();
  return answer;
}

function sourceDir(from) {
  const dir = from ? resolve(from) : join(PKG_ROOT, 'skills');
  if (!existsSync(dir)) fail(`no skills folder at ${dir}`);
  return dir;
}

function buildChecked(source, prefix, out) {
  const names = build(source, prefix, out);
  const problems = check(out, prefix, { canonicalSkills: packSkills(source) });
  if (problems.length) fail(`the built skills are inconsistent:\n  ${problems.join('\n  ')}`);
  return names;
}

async function install(cwd, opts, lock) {
  const prefix = validatePrefix(opts.prefix ?? lock?.prefix ?? (await askPrefix()));
  const agents = opts.agent?.length ? opts.agent : (lock?.agents ?? []);
  const stage = mkdtempSync(join(tmpdir(), 'epicparty-skills-'));
  try {
    const names = buildChecked(sourceDir(opts.from), prefix, join(stage, 'skills'));
    if (opts['dry-run']) {
      console.log(`Built ${names.length} skills for prefix "${prefix}" in ${stage}: ${names.join(', ')}`);
      return;
    }
    const before = lockedSkills(lock);
    const after = Object.fromEntries(names.map((n) => [n, skillVersion(join(stage, 'skills', n))]));
    const stale = Object.keys(before).filter((n) => !names.includes(n));
    if (stale.length) skillsCli(['remove', ...stale, '-y'], cwd);
    skillsCli(['add', stage, '--skill', '*', ...agents.flatMap((a) => ['--agent', a]), '-y'], cwd);
    dropFromSkillsLock(cwd, names);
    writeLock(cwd, {
      prefix,
      version: PKG.version,
      source: opts.from ? resolve(opts.from) : PKG.name,
      agents,
      skills: after,
    });
    console.log(`Installed ${names.length} skills as ${prefix}, ${prefix}-*. Recorded in ${LOCK}.`);
    const changes = versionChanges(before, after);
    if (lock && changes.length) console.log(`Changed:\n${changes.join('\n')}`);
  } finally {
    if (!opts['dry-run']) rmSync(stage, { recursive: true, force: true });
  }
}

const { values: opts, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    prefix: { type: 'string' },
    agent: { type: 'string', multiple: true },
    from: { type: 'string' },
    out: { type: 'string' },
    'dry-run': { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
  },
});
const [command, ...rest] = positionals;
const cwd = process.cwd();

if (opts.version) console.log(PKG.version);
else if (opts.help || !command) console.log(HELP);
else if (command === 'add') await install(cwd, opts, readLock(cwd));
else if (command === 'update') {
  const lock = readLock(cwd) ?? fail(`no ${LOCK} here: run "add" first`);
  await install(cwd, { ...opts, prefix: opts.prefix ?? lock.prefix }, lock);
} else if (command === 'remove') {
  const lock = readLock(cwd) ?? fail(`no ${LOCK} here: nothing to remove`);
  skillsCli(['remove', ...Object.keys(lockedSkills(lock)), '-y'], cwd);
  rmSync(join(cwd, LOCK));
} else if (command === 'build') {
  if (!opts.prefix || !opts.out) fail('build needs --prefix and --out');
  const names = buildChecked(sourceDir(opts.from), validatePrefix(opts.prefix), resolve(opts.out));
  console.log(`Built ${names.length} skills in ${resolve(opts.out)}`);
} else if (command === 'check') {
  const prefix = validatePrefix(opts.prefix ?? readLock(cwd)?.prefix ?? fail('check needs --prefix'));
  const dir = resolve(rest[0] ?? '.agents/skills');
  const problems = check(dir, prefix, { canonicalSkills: packSkills(sourceDir(opts.from)) });
  if (problems.length) fail(`${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  console.log(`OK: the ${prefix} skills in ${dir} are consistent.`);
} else fail(`unknown command "${command}"\n\n${HELP}`);
