// Deterministic graders. Each takes the finished project and the grader's own options from
// task.json, and returns { pass, detail }. None of them asks a model: a grader that judges is a
// second agent to evaluate.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { git } from './workspace.mjs';

const ok = (detail = '') => ({ pass: true, detail });
const no = (detail) => ({ pass: false, detail });

function npmTest(dir) {
  // A runner started under `node --test` passes NODE_TEST_CONTEXT down, and a nested
  // `node --test` then reports to it instead of exiting with its own status.
  const { NODE_TEST_CONTEXT, ...env } = process.env;
  const r = spawnSync('npm', ['test', '--silent'], { cwd: dir, env, encoding: 'utf8', timeout: 120_000 });
  return { status: r.status, output: `${r.stdout}${r.stderr}`.slice(-2000) };
}

/** The test files the agent added or changed since the base commit. */
function changedTests(ctx) {
  const listed = git(ctx.dir, 'diff', '--name-only', ctx.base, 'HEAD', '--', 'test');
  return listed ? listed.split('\n') : [];
}

/** A copy of the finished project, to run something against without touching it. */
function scratchCopy(ctx) {
  const copy = mkdtempSync(join(tmpdir(), 'grade-'));
  cpSync(ctx.dir, copy, { recursive: true });
  return copy;
}

/** The text of a `## <heading>` section in a Markdown file, or null. */
function section(text, heading) {
  const m = new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm').exec(text);
  return m ? m[1].trim() : null;
}

export const graders = {
  /** The work is committed on a branch of its own, not on main. */
  'on-a-branch'(ctx) {
    const branch = git(ctx.dir, 'branch', '--show-current');
    if (branch === 'main') return no('still on main');
    const ahead = Number(git(ctx.dir, 'rev-list', '--count', `${ctx.base}..HEAD`));
    return ahead > 0 ? ok(`${branch}, ${ahead} commit(s)`) : no(`${branch} has no commits past the base`);
  },

  /** The project's own suite passes on the committed head. */
  'suite-green'(ctx) {
    const r = npmTest(ctx.dir);
    return r.status === 0 ? ok() : no(r.output);
  },

  /**
   * The tests the agent added fail when the code under `paths` is put back to the base: they were
   * red before the change, so they catch the defect the change fixes.
   */
  'new-tests-red-on-base'(ctx, { paths }) {
    const tests = changedTests(ctx);
    if (tests.length === 0) return no('no test was added or changed');
    const copy = scratchCopy(ctx);
    try {
      // Put the code back as it was: files the agent added go, files it changed are restored.
      const added = git(copy, 'diff', '--name-only', '--diff-filter=A', ctx.base, 'HEAD', '--', ...paths);
      for (const file of added ? added.split('\n') : []) rmSync(join(copy, file), { force: true });
      git(copy, 'checkout', ctx.base, '--', ...paths);
      const r = npmTest(copy);
      return r.status !== 0 ? ok(tests.join(', ')) : no(`${tests.join(', ')} pass on the base code too`);
    } finally {
      rmSync(copy, { recursive: true, force: true });
    }
  },

  /** Every test the fixture had is still there, unweakened: its lines were only added to. */
  'existing-tests-kept'(ctx, { files }) {
    for (const file of files) {
      if (!existsSync(join(ctx.dir, file))) return no(`${file} was deleted`);
      const removed = git(ctx.dir, 'diff', ctx.base, 'HEAD', '--', file)
        .split('\n')
        .filter((line) => line.startsWith('-') && !line.startsWith('---') && line.trim() !== '-');
      if (removed.length) return no(`${file} lost lines:\n${removed.join('\n')}`);
    }
    return ok();
  },

  /** Held-out tests the agent never saw pass against its code. */
  'hidden-tests-pass'(ctx, { into }) {
    const hidden = join(ctx.task.dir, 'hidden');
    const copy = scratchCopy(ctx);
    try {
      for (const file of readdirSync(hidden)) cpSync(join(hidden, file), join(copy, into, `held-out-${file}`));
      const r = npmTest(copy);
      return r.status === 0 ? ok() : no(r.output);
    } finally {
      rmSync(copy, { recursive: true, force: true });
    }
  },

  /** No tagged debug log survived the cleanup. */
  'no-debug-logs'(ctx, { paths }) {
    const r = spawnSync('grep', ['-rn', '\\[DEBUG-', ...paths], { cwd: ctx.dir, encoding: 'utf8' });
    return r.status === 1 ? ok() : no(r.stdout.trim() || r.stderr.trim());
  },

  /** The settings home is named in the agent file's `## Agent skills` block. */
  'settings-home-recorded'(ctx, { file }) {
    const path = join(ctx.dir, file);
    if (!existsSync(path)) return no(`${file} is missing`);
    const block = section(readFileSync(path, 'utf8'), 'Agent skills');
    if (!block) return no(`${file} has no ## Agent skills block`);
    return /settings/i.test(block) ? ok(block.split('\n')[0]) : no(block);
  },

  /** A setting is written under its own heading, and its value matches when the task says what. */
  'setting-written'(ctx, { file, heading, matches }) {
    const path = join(ctx.dir, file);
    if (!existsSync(path)) return no(`${file} is missing`);
    const body = section(readFileSync(path, 'utf8'), heading);
    if (body === null) return no(`${file} has no ## ${heading}`);
    if (!body) return no(`## ${heading} is empty`);
    if (matches && !new RegExp(matches, 'i').test(body)) return no(`## ${heading} reads: ${body.slice(0, 200)}`);
    return ok(body.split('\n')[0]);
  },

  /** A setting that should have been ruled out was not written. */
  'setting-absent'(ctx, { file, heading }) {
    const path = join(ctx.dir, file);
    if (!existsSync(path)) return ok();
    return section(readFileSync(path, 'utf8'), heading) === null ? ok() : no(`${file} has ## ${heading}`);
  },

  /** The agent asked the user at most `max` questions through its question tool. */
  'questions-at-most'(ctx, { max }) {
    return ctx.questions <= max ? ok(`${ctx.questions} asked`) : no(`${ctx.questions} asked, at most ${max}`);
  },

  /** The agent's final reply matches a pattern, case-insensitively. */
  'output-matches'(ctx, { pattern }) {
    return new RegExp(pattern, 'i').test(ctx.output) ? ok() : no(`no match for /${pattern}/i`);
  },

  /** A read-only task left the commits and the working tree as it found them. */
  'tree-unchanged'(ctx) {
    const head = git(ctx.dir, 'rev-parse', 'HEAD');
    const status = git(ctx.dir, 'status', '--porcelain');
    if (head !== ctx.base) return no(`HEAD moved to ${head}`);
    return status ? no(status) : ok();
  },
};

/** Runs every grader the task lists. Returns [{ name, label, pass, detail }]. */
export function grade(task, ctx) {
  return task.graders.map((spec) => {
    const { name, label, ...options } = spec;
    const fn = graders[name];
    if (!fn) return { name, label: label ?? name, pass: false, detail: `unknown grader "${name}"` };
    try {
      return { name, label: label ?? describe(spec), ...fn({ ...ctx, task }, options) };
    } catch (error) {
      return { name, label: label ?? describe(spec), pass: false, detail: String(error.message ?? error) };
    }
  });
}

/** A stable label for a grader row, so runs compare row by row. */
export function describe({ name, label, ...options }) {
  if (label) return label;
  const parts = Object.values(options).map((v) => (Array.isArray(v) ? v.join(',') : String(v)));
  return parts.length ? `${name} ${parts.join(' ')}` : name;
}
