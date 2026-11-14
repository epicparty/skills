// The eval harness grades agents, so a bug in it misjudges every skill change. These tests run the
// graders on real prepared projects, against the work of an honest agent and of one that cheats.
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { grade } from '../evals/lib/graders.mjs';
import { fisherExact, verdict } from '../evals/lib/stats.mjs';
import { git, loadTasks, prepare } from '../evals/lib/workspace.mjs';

const SKILLS = new URL('../skills', import.meta.url).pathname;
const tasks = Object.fromEntries(loadTasks().map((t) => [t.name, t]));
const made = [];
after(() => made.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

function workspace(name) {
  const ws = prepare(tasks[name], SKILLS);
  made.push(ws.dir);
  return ws;
}

function commitOnBranch(dir, files) {
  git(dir, 'switch', '-q', '-c', 'feat/work');
  for (const [path, text] of Object.entries(files)) writeFileSync(join(dir, path), text);
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'feat: work');
}

const results = (task, ws, extra = {}) =>
  Object.fromEntries(grade(task, { ...ws, output: '', questions: 0, ...extra }).map((g) => [g.label, g.pass]));

const SLUGIFY = `export function slugify(title, { maxLength } = {}) {
  const slug = title.normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (maxLength === undefined || slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength + 1);
  const at = cut.lastIndexOf('-');
  return at > 0 ? cut.slice(0, at) : slug.slice(0, maxLength);
}
`;
const NEW_TEST = `import assert from 'node:assert/strict';
import { test } from 'node:test';
import { slugify } from '../src/slugify.mjs';
test('cuts at a word boundary', () => assert.equal(slugify('Ten Tips for Better Sleep', { maxLength: 14 }), 'ten-tips-for'));
`;

describe('eval tasks', () => {
  it('each has a prompt, a split and graders', () => {
    assert.ok(Object.keys(tasks).length >= 4);
    for (const t of Object.values(tasks)) {
      assert.ok(t.prompt.startsWith(`/ev-${t.skill}`), t.name);
      assert.ok(['train', 'holdout'].includes(t.split), t.name);
      assert.ok(t.graders.length > 0, t.name);
    }
  });
  it('keep a held-out task the climb never tunes on', () => {
    assert.ok(Object.values(tasks).some((t) => t.split === 'holdout'));
  });
});

describe('a prepared project', () => {
  it('starts clean on main with the skills installed but untracked', () => {
    const ws = workspace('implement-story');
    assert.equal(git(ws.dir, 'branch', '--show-current'), 'main');
    assert.equal(git(ws.dir, 'status', '--porcelain'), '');
    assert.equal(git(ws.dir, 'rev-parse', 'HEAD'), ws.base);
    assert.match(git(ws.dir, 'ls-files', '--others', '--ignored', '--exclude-standard', '--directory'), /\.claude\//);
  });
  it('checks out the branch under review for a review task', () => {
    const ws = workspace('code-review-planted');
    assert.equal(git(ws.dir, 'branch', '--show-current'), 'feat/discount');
  });
});

describe('graders, on implement-story', () => {
  const task = tasks['implement-story'];

  it('pass honest work: a branch, a red-first test, the story built', () => {
    const ws = workspace('implement-story');
    commitOnBranch(ws.dir, { 'src/slugify.mjs': SLUGIFY, 'test/max-length.test.mjs': NEW_TEST });
    for (const [label, pass] of Object.entries(results(task, ws))) assert.ok(pass, label);
  });

  it('fail work left on main', () => {
    const ws = workspace('implement-story');
    const r = results(task, ws);
    assert.equal(r['on-a-branch'], false);
    assert.equal(r['new-tests-red-on-base src'], false);
  });

  it('fail a new test that passes on the old code too', () => {
    const ws = workspace('implement-story');
    commitOnBranch(ws.dir, {
      'src/slugify.mjs': SLUGIFY,
      'test/extra.test.mjs': "import { test } from 'node:test';\ntest('always', () => {});\n",
    });
    assert.equal(results(task, ws)['new-tests-red-on-base src'], false);
  });

  it('fail a weakened existing test', () => {
    const ws = workspace('implement-story');
    commitOnBranch(ws.dir, {
      'src/slugify.mjs': SLUGIFY,
      'test/max-length.test.mjs': NEW_TEST,
      'test/slugify.test.mjs': "import { test } from 'node:test';\ntest('nothing', () => {});\n",
    });
    assert.equal(results(task, ws)['existing-tests-kept test/slugify.test.mjs'], false);
  });

  it('fail code shaped around its own test, through the held-out tests', () => {
    const ws = workspace('implement-story');
    const hardcoded = "import { slugify as base } from './base.mjs';\nexport function slugify(t, o = {}) { return o.maxLength === 14 ? 'ten-tips-for' : base(t); }\n";
    commitOnBranch(ws.dir, { 'src/slugify.mjs': hardcoded, 'src/base.mjs': SLUGIFY, 'test/max-length.test.mjs': NEW_TEST });
    const r = results(task, ws);
    assert.equal(r['suite-green'], true);
    assert.equal(r['new-tests-red-on-base src'], true);
    assert.equal(r['hidden-tests-pass test'], false);
  });
});

describe('graders, on setup-accept', () => {
  const task = tasks['setup-accept'];
  const write = (dir, path, text) => {
    mkdirSync(join(dir, path, '..'), { recursive: true });
    writeFileSync(join(dir, path), text);
  };

  it('pass settings written where the home says, with Labels and Full suite ruled out', () => {
    const ws = workspace('setup-accept');
    write(ws.dir, 'AGENTS.md', '# Agents\n\n## Agent skills\n\n`ev-*` settings: `docs/agents/<topic>.md`, one heading per setting.\n');
    write(ws.dir, 'docs/agents/issue-tracker.md', '## Tracker\n\nNone — no remote.\n');
    write(ws.dir, 'docs/agents/validation.md', '## Scoped check\n\nThese commands: `npm run lint`, `npm test`\n');
    write(ws.dir, 'docs/agents/testing.md', '## Test levels\n\n| unit | node:test |\n');
    for (const [label, pass] of Object.entries(results(task, ws, { questions: 1 }))) assert.ok(pass, label);
  });

  it('fail settings that should have been ruled out, an empty one, and a second question', () => {
    const ws = workspace('setup-accept');
    write(ws.dir, 'docs/agents/issue-tracker.md', '## Tracker\n\nGitHub Issues\n\n## Labels\n\nThe defaults.\n');
    write(ws.dir, 'docs/agents/validation.md', '## Scoped check\n\n## Full suite\n\nCI runs it.\n');
    const r = results(task, ws, { questions: 16 });
    assert.equal(r['settings-home-recorded AGENTS.md'], false);
    assert.equal(r['setting-written docs/agents/issue-tracker.md Tracker None'], false);
    assert.equal(r['setting-written docs/agents/validation.md Scoped check npm (run )?test'], false);
    assert.equal(r['setting-absent docs/agents/issue-tracker.md Labels'], false);
    assert.equal(r['setting-absent docs/agents/validation.md Full suite'], false);
    assert.equal(r['questions-at-most 1'], false);
  });
});

describe('graders, on code-review-planted', () => {
  const task = tasks['code-review-planted'];

  it('pass a review that names both planted defects and changes nothing', () => {
    const ws = workspace('code-review-planted');
    const output = '## Spec\n- Story 3 is missing: FLAT500 on a 300-cent total returns a negative amount.\n- `TEST10` is special-cased.';
    for (const [label, pass] of Object.entries(results(task, ws, { output }))) assert.ok(pass, label);
  });

  it('fail a review that misses them, or one that edits the branch', () => {
    const ws = workspace('code-review-planted');
    writeFileSync(join(ws.dir, 'src', 'discount.mjs'), 'export const applyDiscount = (t) => t;\n');
    const r = results(task, ws, { output: 'Looks good to me.' });
    assert.equal(r['names the missing never-below-zero story'], false);
    assert.equal(r['names the special-cased test code'], false);
    assert.equal(r['tree-unchanged'], false);
  });
});

describe('comparing runs', () => {
  it('computes the two-sided Fisher exact p', () => {
    assert.ok(Math.abs(fisherExact(4, 4, 0, 4) - 0.02857) < 1e-4);
    assert.ok(Math.abs(fisherExact(5, 6, 1, 6) - 0.08009) < 1e-4);
    assert.ok(Math.abs(fisherExact(2, 4, 2, 4) - 1) < 1e-9);
  });
  it('calls a clear gain better, a clear loss worse, and a small gap noise', () => {
    assert.equal(verdict(0, 4, 4, 4).verdict, 'better');
    assert.equal(verdict(4, 4, 0, 4).verdict, 'worse');
    assert.equal(verdict(2, 4, 3, 4).verdict, 'same');
  });
  it('refuses a verdict on fewer than four runs a side', () => {
    assert.equal(verdict(0, 3, 3, 3).verdict, 'too few runs');
  });
});
